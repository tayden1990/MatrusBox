import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { sessionId } = body || {};
    try {
      const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
      console.log('[API] /study/end POST incoming', { sessionId, hasAuth: !!authHeader, authMasked: masked });
    } catch {}

    if (!sessionId) {
      return NextResponse.json({ success: false, message: 'sessionId required' }, { status: 400 });
    }

    // Demo: backend demo endpoint for end is not present; return a mocked success stats
    const stats = {
      cardsLearned: Math.floor(Math.random() * 10) + 5,
      averageAccuracy: 0.75 + Math.random() * 0.2,
      streakDays: Math.floor(Math.random() * 10) + 1,
      timeStudiedToday: Math.floor(Math.random() * 1800) + 600,
    };
    return NextResponse.json({ success: true, data: { sessionId, stats } });
  } catch (error) {
    console.error('Study end API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to end session' }, { status: 500 });
  }
}
