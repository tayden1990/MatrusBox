import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = (await request.json().catch(() => ({}))) as any;
    try {
      const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
      console.log('[API] /study/start POST incoming', { hasAuth: !!authHeader, authMasked: masked });
    } catch {}

    const dto = {
      type: body?.type || 'mixed',
      limit: body?.limit ?? 10,
    };

    // Use demo endpoint to avoid auth requirement
    const apiUrl = `${API_BASE_URL}/api/study/session/demo`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(dto),
    });
    try { console.log('[API] backend status', { status: response.status, ok: response.ok }); } catch {}

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Study start API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to start session' }, { status: 500 });
  }
}
