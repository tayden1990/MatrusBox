/* eslint-disable no-console */
// Lightweight client-side debug bus with in-memory + localStorage persistence
// Exposes window.__DEBUG__ for quick inspection

export type DebugLevel = 'log' | 'info' | 'warn' | 'error' | 'net' | 'auth';

export interface DebugEntry {
  id: string;
  t: number; // epoch ms
  lvl: DebugLevel;
  msg: string;
  data?: unknown;
}

type Listener = (e: DebugEntry) => void;

const LS_KEY_ENABLED = 'debug.enabled';
const LS_KEY_LOGS = 'debug.logs';
const MAX_LOGS = 1000;

function safeStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '[unserializable]';
  }
}

function maskAuthHeader(headers?: HeadersInit | Record<string, any>) {
  try {
    const h: Record<string, string> = Array.isArray(headers)
      ? Object.fromEntries(headers as any)
      : (headers as any) || {};
    const auth = h.Authorization || h.authorization;
    if (!auth) return h;
    const [scheme, token] = String(auth).split(' ');
    if (!token) return { ...h, Authorization: scheme };
    const masked = token.length <= 8 ? '****' : token.slice(0, 4) + '…' + token.slice(-4);
    return { ...h, Authorization: `${scheme} ${masked}` };
  } catch {
    return headers as any;
  }
}

class DebugBus {
  private logs: DebugEntry[] = [];
  private listeners: Set<Listener> = new Set();
  private enabled = false;

  constructor() {
    // restore enabled state and logs (best-effort)
    try {
      this.enabled = (localStorage.getItem(LS_KEY_ENABLED) || 'false') === 'true';
      const raw = localStorage.getItem(LS_KEY_LOGS);
      if (raw) this.logs = JSON.parse(raw);
    } catch {}
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    try {
      localStorage.setItem(LS_KEY_ENABLED, String(v));
    } catch {}
    this.emit({ lvl: 'info', msg: `debug ${v ? 'enabled' : 'disabled'}`, id: crypto.randomUUID(), t: Date.now() });
  }

  on(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getAll() {
    return this.logs.slice();
  }

  clear() {
    this.logs = [];
    try {
      localStorage.removeItem(LS_KEY_LOGS);
    } catch {}
  }

  download(filename = `debug-${new Date().toISOString()}.json`) {
    const blob = new Blob([safeStringify(this.logs)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  emit(e: Omit<DebugEntry, 'id' | 't'> & { id?: string; t?: number }) {
    const entry: DebugEntry = {
      id: e.id || (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
      t: e.t || Date.now(),
      lvl: e.lvl,
      msg: e.msg,
      data: e.data,
    };
    this.logs.push(entry);
    if (this.logs.length > MAX_LOGS) this.logs.splice(0, this.logs.length - MAX_LOGS);
    try {
      localStorage.setItem(LS_KEY_LOGS, safeStringify(this.logs));
    } catch {}
    this.listeners.forEach((l) => l(entry));
    // Mirror to console
    const prefix = `[DBG ${new Date(entry.t).toLocaleTimeString()}]`;
    const args: any[] = [prefix, entry.lvl.toUpperCase(), '-', entry.msg];
    if (typeof entry.data !== 'undefined') args.push(entry.data);
    switch (entry.lvl) {
      case 'warn':
        console.warn(...args);
        break;
      case 'error':
        console.error(...args);
        break;
      default:
        console.log(...args);
    }
  }

  log(msg: string, data?: unknown) {
    if (!this.enabled) return;
    this.emit({ lvl: 'log', msg, data });
  }
  info(msg: string, data?: unknown) {
    if (!this.enabled) return;
    this.emit({ lvl: 'info', msg, data });
  }
  warn(msg: string, data?: unknown) {
    if (!this.enabled) return;
    this.emit({ lvl: 'warn', msg, data });
  }
  error(msg: string, data?: unknown) {
    if (!this.enabled) return;
    this.emit({ lvl: 'error', msg, data });
  }
  net(msg: string, data?: unknown) {
    if (!this.enabled) return;
    this.emit({ lvl: 'net', msg, data });
  }
  auth(msg: string, data?: unknown) {
    if (!this.enabled) return;
    this.emit({ lvl: 'auth', msg, data });
  }
}

export const Debug = new DebugBus();

// Initialize from URL param ?debug=1
export function initDebugFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const dbg = params.get('debug');
    if (dbg === '1' || dbg === 'true') Debug.setEnabled(true);
  } catch {}
}

export function instrumentFetch() {
  if (typeof window === 'undefined' || (window as any).__fetch_patched__) return;
  const original = window.fetch.bind(window);
  (window as any).__fetch_patched__ = true;
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const method = (init?.method || (typeof input !== 'string' && (input as Request).method) || 'GET').toUpperCase();
    const headers = init?.headers || (typeof input !== 'string' ? (input as Request).headers : undefined);
    const logReq = {
      method,
      url,
      headers: maskAuthHeader(headers as any),
      body: init?.body ? '[body set]' : undefined,
    };
    Debug.net('HTTP request', logReq);
    try {
      const res = await original(input, init);
      const resInfo = {
        url: res.url || url,
        status: res.status,
        ok: res.ok,
        headers: Object.fromEntries(res.headers.entries()),
      };
      Debug.net('HTTP response', resInfo);
      if (res.status === 401) {
        Debug.auth('401 Unauthorized', { url, method });
      }
      return res;
    } catch (err) {
      Debug.error('HTTP error', { url, method, error: String(err) });
      throw err;
    }
  };
}

declare global {
  interface Window {
    __DEBUG__?: typeof Debug;
  }
}

export function exposeDebugOnWindow() {
  try {
    (window as any).__DEBUG__ = Debug;
  } catch {}
}

export function getAuthSnapshot() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const decode = (t?: string | null) => {
      if (!t) return undefined;
      const parts = t.split('.');
      if (parts.length < 2) return undefined;
      try {
        return JSON.parse(atob(parts[1]));
      } catch {
        return undefined;
      }
    };
    return {
      accessTokenMasked: accessToken ? accessToken.slice(0, 4) + '…' + accessToken.slice(-4) : null,
      refreshTokenMasked: refreshToken ? refreshToken.slice(0, 4) + '…' + refreshToken.slice(-4) : null,
      accessPayload: decode(accessToken || undefined),
      refreshPayload: decode(refreshToken || undefined),
    };
  } catch {
    return { error: 'no localStorage' } as any;
  }
}
