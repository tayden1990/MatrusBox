// Test script to check if user authentication is working from frontend
async function testFrontendAuth() {
  try {
    console.log('🔍 Checking Frontend Authentication State...');
    
    // Check if we have tokens in localStorage (simulate browser environment)
    console.log('📝 Testing login first...');
    
    // Login to get fresh token
    const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.accessToken;
    console.log('✅ Login successful!');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

    // Now test via the frontend API route (same as browser would do)
    console.log('\n📤 Testing Frontend API Route (/api/cards)...');
    
    const frontendResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        front: 'Test Frontend Card',
        back: 'Testing through frontend API',
        explanation: 'This should work with proper auth',
        difficulty: 3
      }),
    });

    console.log('Frontend API status:', frontendResponse.status);
    
    const frontendData = await frontendResponse.json();
    console.log('Frontend API response:', frontendData);

    if (frontendResponse.ok) {
      console.log('✅ Frontend API call successful!');
    } else {
      console.log('❌ Frontend API call failed');
      
      // Also test direct backend call for comparison
      console.log('\n🔄 Testing Direct Backend Call...');
      const backendResponse = await fetch('http://localhost:4000/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          front: 'Test Backend Card',
          back: 'Testing direct backend',
          explanation: 'Direct backend test',
          difficulty: 3
        }),
      });
      
      console.log('Direct backend status:', backendResponse.status);
      const backendData = await backendResponse.json();
      console.log('Direct backend response:', backendData);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendAuth();