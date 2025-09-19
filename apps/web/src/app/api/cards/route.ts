import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    
    const authHeader = request.headers.get('authorization');
    
    let apiUrl = `${API_BASE_URL}/api/cards?page=${page}&limit=${limit}`;
    if (tag) apiUrl += `&tag=${encodeURIComponent(tag)}`;
    if (search) apiUrl += `&search=${encodeURIComponent(search)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      }
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status 
    });
  } catch (error) {
    console.error('Cards GET API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch cards',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    const apiUrl = `${API_BASE_URL}/api/cards`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status 
    });
  } catch (error) {
    console.error('Cards POST API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create card',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}