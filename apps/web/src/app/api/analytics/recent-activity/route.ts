import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user';
    const authHeader = request.headers.get('authorization');
    try {
      const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
      console.log('[API] /analytics/recent-activity incoming', { userId, hasAuth: !!authHeader, authMasked: masked });
    } catch {}

    const response = await fetch(`${API_BASE_URL}/api/analytics/recent-activity?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
    });
    try { console.log('[API] backend status', { status: response.status, ok: response.ok }); } catch {}

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Backend returns { success: true, data: [...] }
    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : payload;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Recent activity API error:', error);
    
    // Return fallback data
    return NextResponse.json([
      {
        id: '1',
        type: 'study',
        description: 'Completed study session',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        score: 85,
        count: 12
      },
      {
        id: '2',
        type: 'create',
        description: 'Created new cards',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        count: 8
      },
      {
        id: '3',
        type: 'ai_generate',
        description: 'AI generated cards',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        count: 15
      }
    ]);
  }
}