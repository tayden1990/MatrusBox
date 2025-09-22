import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    try {
      const masked = authHeader ? `${authHeader.split(' ')[0]} ${authHeader.slice(0,4)}…${authHeader.slice(-4)}` : 'none';
      console.log('[API] /analytics/global-stats incoming', { hasAuth: !!authHeader, authMasked: masked });
    } catch {}
    
    const apiUrl = `${API_BASE_URL}/api/analytics/global-stats`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    });
    try { console.log('[API] backend status', { status: response.status, ok: response.ok }); } catch {}

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status 
    });
  } catch (error) {
    console.error('Analytics global stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch global stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}