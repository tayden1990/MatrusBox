'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { Debug, exposeDebugOnWindow, initDebugFromUrl, instrumentFetch, getAuthSnapshot } from '@/lib/debug';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    // Initialize debug on client
    initDebugFromUrl();
    instrumentFetch();
    exposeDebugOnWindow();

    // React Query global error logging
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      // We're interested when a query updates into an error state
      if (event?.type === 'queryUpdated') {
        const q: any = (event as any).query;
        if (q?.state?.status === 'error') {
          Debug.error('RQ error', {
            queryKey: q.queryKey,
            error: q.state?.error,
          });
        }
      }
    });
    return () => {
      try { unsubscribe?.(); } catch {}
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <DebugConsole />
    </QueryClientProvider>
  );
}

function DebugConsole() {
  const [open, setOpen] = React.useState(false);
  const [logs, setLogs] = React.useState(Debug.getAll());
  const [enabled, setEnabled] = React.useState(Debug.isEnabled());
  const [authOpen, setAuthOpen] = React.useState(true);
  const [auth, setAuth] = React.useState<any | null>(null);

  React.useEffect(() => {
    const off = Debug.on((e) => setLogs((prev) => [...prev, e].slice(-1000)));
    return () => {
      try { off?.(); } catch {}
    };
  }, []);

  const toggle = () => {
    Debug.setEnabled(!enabled);
    setEnabled(Debug.isEnabled());
  };

  const clear = () => {
    Debug.clear();
    setLogs([]);
  };

  const refreshAuth = () => {
    try { setAuth(getAuthSnapshot()); } catch {}
  };

  React.useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 12, right: 12, zIndex: 9999 }}>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 6 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ padding: '6px 10px', background: '#111827', color: 'white', borderRadius: 6, fontSize: 12 }}
        >
          {open ? 'Hide Debug' : 'Show Debug'}
        </button>
        <button
          onClick={toggle}
          style={{ padding: '6px 10px', background: enabled ? '#059669' : '#4b5563', color: 'white', borderRadius: 6, fontSize: 12 }}
        >
          {enabled ? 'Debug ON' : 'Debug OFF'}
        </button>
        <button
          onClick={() => Debug.download()}
          style={{ padding: '6px 10px', background: '#2563eb', color: 'white', borderRadius: 6, fontSize: 12 }}
        >
          Download
        </button>
        <button
          onClick={clear}
          style={{ padding: '6px 10px', background: '#b91c1c', color: 'white', borderRadius: 6, fontSize: 12 }}
        >
          Clear
        </button>
      </div>
      {open && (
        <div style={{ width: 460, maxHeight: 380, background: 'rgba(17,24,39,0.95)', color: '#e5e7eb', borderRadius: 8, padding: 8, overflow: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.35)' }}>
          {/* Auth Snapshot Panel */}
          <div style={{ marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <strong>Auth snapshot</strong>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setAuthOpen((v) => !v)} style={{ padding: '2px 6px', fontSize: 11, borderRadius: 4, background: '#374151', color: 'white' }}>
                  {authOpen ? 'Hide' : 'Show'}
                </button>
                <button onClick={refreshAuth} style={{ padding: '2px 6px', fontSize: 11, borderRadius: 4, background: '#4b5563', color: 'white' }}>
                  Refresh
                </button>
              </div>
            </div>
            {authOpen && (
              <pre style={{ margin: 0, marginTop: 6, whiteSpace: 'pre-wrap', fontSize: 12, background: '#111827', padding: 6, borderRadius: 4 }}>
                {JSON.stringify(auth, null, 2)}
              </pre>
            )}
          </div>
          {logs.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No logs yet. Enable debug and interact with the app.</div>
          ) : (
            logs.slice(-500).map((l) => (
              <div key={l.id} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12, marginBottom: 4 }}>
                <span style={{ opacity: 0.6 }}>{new Date(l.t).toLocaleTimeString()}</span>
                <span style={{ marginLeft: 8, color: colorForLevel(l.lvl) }}>[{l.lvl.toUpperCase()}]</span>
                <span style={{ marginLeft: 8 }}>{l.msg}</span>
                {typeof l.data !== 'undefined' && (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', opacity: 0.9 }}>
                    {JSON.stringify(l.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function colorForLevel(level: string) {
  switch (level) {
    case 'error':
      return '#f87171';
    case 'warn':
      return '#fbbf24';
    case 'auth':
      return '#34d399';
    case 'net':
      return '#60a5fa';
    default:
      return '#a78bfa';
  }
}