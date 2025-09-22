import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { sessionId, cardId } = body || {};
    // Accept either 'correct' (boolean) or 'result' (string: correct|incorrect|skip)
    let correct: boolean | undefined = undefined;
    if (typeof body?.correct === 'boolean') correct = body.correct;
    if (typeof body?.result === 'string') {
      const r = String(body.result).toLowerCase();
      correct = r === 'correct'; // map 'incorrect' and 'skip' to false
    }
    try {
      const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
      console.log('[API] /study/answer POST incoming', { sessionId, cardId, correct, hasAuth: !!authHeader, authMasked: masked });
    } catch {}

    if (!sessionId || !cardId || typeof correct !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Missing sessionId, cardId or correct' }, { status: 400 });
    }

    // Use demo endpoint to avoid auth requirement
    const apiUrl = `${API_BASE_URL}/api/study/session/${encodeURIComponent(sessionId)}/answer/demo`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({ cardId, correct }),
    });
    try { console.log('[API] backend status', { status: response.status, ok: response.ok }); } catch {}

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Study answer API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit answer' }, { status: 500 });
  }
}
