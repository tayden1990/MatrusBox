import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const apiUrl = `${API_BASE_URL}/api/ai/generate-card-demo`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status 
    });
  } catch (error) {
    console.error('AI generate card demo API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate demo card',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}