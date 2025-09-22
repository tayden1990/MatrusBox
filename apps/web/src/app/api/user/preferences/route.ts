import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

async function getUserIdFromProfile(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) return null;
    const data = await res.json();
    // common shapes: { id, user: { id } }
    return data?.id || data?.user?.id || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
    try { console.log('[API] GET /user/preferences', { hasAuth: !!authHeader, authMasked: masked }); } catch {}

    const userId = await getUserIdFromProfile(authHeader);
    if (!userId) {
      return NextResponse.json({ studyShortcuts: null }, { status: 200 });
    }

    const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/settings`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });
    if (!res.ok) {
      return NextResponse.json({ studyShortcuts: null }, { status: 200 });
    }
    const data = await res.json();
    // Expect { success: true, data: { studyShortcuts: {...} } }
    const settings = data?.data || data || {};
    return NextResponse.json({ studyShortcuts: settings?.studyShortcuts ?? null }, { status: 200 });
  } catch (error) {
    console.error('User preferences GET error:', error);
    return NextResponse.json({ studyShortcuts: null }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
    const body = await request.json();
    try { console.log('[API] PUT /user/preferences', { hasAuth: !!authHeader, authMasked: masked, keys: Object.keys(body || {}) }); } catch {}

    const userId = await getUserIdFromProfile(authHeader);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'No user' }, { status: 200 });
    }
    const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: res.ok, ...data }, { status: 200 });
  } catch (error) {
    console.error('User preferences PUT error:', error);
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
