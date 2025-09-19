import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || 'demo-user';
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${API_BASE_URL}/api/analytics/dashboard-stats?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Backend returns { success: true, data: { totalCards, masteredCards, studyStreak, totalUsers, accuracy } }
    const payload = await response.json();
    const raw = payload?.data ?? payload;
    // Normalize to dashboard UI expected shape
    const normalized = {
      cardsStudied: Number(raw?.masteredCards ?? 0),
      sessionsToday: 0, // Not provided by backend yet
      currentStreak: Number(raw?.studyStreak ?? 0),
      accuracy: Number(raw?.accuracy ?? 0),
      totalCards: Number(raw?.totalCards ?? 0),
      dueCards: 0 // Not provided by backend yet
    };
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    
    // Return fallback data
    return NextResponse.json({
      cardsStudied: 0,
      sessionsToday: 0,
      currentStreak: 0,
      accuracy: 0,
      totalCards: 0,
      dueCards: 0
    });
  }
}