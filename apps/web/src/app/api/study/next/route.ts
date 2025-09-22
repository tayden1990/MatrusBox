import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || '';
    const authHeader = request.headers.get('authorization');
    try {
      const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
      console.log('[API] /study/next GET incoming', { sessionId, hasAuth: !!authHeader, authMasked: masked });
    } catch {}

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'sessionId required' }, { status: 400 });
    }

    // Use demo endpoint to avoid auth requirement
    const apiUrl = `${API_BASE_URL}/api/study/session/${encodeURIComponent(sessionId)}/next/demo`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });
    try { console.log('[API] backend status', { status: response.status, ok: response.ok }); } catch {}

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Study next API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch next card' }, { status: 500 });
  }
}
