// Debug script to test frontend token handling specifically
async function debugFrontendTokenIssue() {
  try {
    console.log('🔍 Debugging Frontend Token Handling');
    console.log('=====================================');
    
    // Step 1: Get a fresh token
    console.log('\n1. Getting fresh token...');
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
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData);
      return;
    }

    const token = loginData.data.accessToken;
    console.log('✅ Got token:', token.substring(0, 50) + '...');

    // Step 2: Test direct backend call (this works)
    console.log('\n2. Testing direct backend call...');
    const directResponse = await fetch('http://localhost:4000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        front: 'Direct Backend Test',
        back: 'Testing direct backend',
        explanation: 'Should work',
        difficulty: 3
      }),
    });

    console.log('Direct backend status:', directResponse.status);
    if (directResponse.ok) {
      console.log('✅ Direct backend call successful');
    } else {
      const errorData = await directResponse.json();
      console.log('❌ Direct backend failed:', errorData);
    }

    // Step 3: Test through frontend API (this might fail)
    console.log('\n3. Testing through frontend API...');
    const frontendResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        front: 'Frontend API Test',
        back: 'Testing frontend API',
        explanation: 'Might fail',
        difficulty: 3
      }),
    });

    console.log('Frontend API status:', frontendResponse.status);
    if (frontendResponse.ok) {
      console.log('✅ Frontend API call successful');
      const data = await frontendResponse.json();
      console.log('Response:', data);
    } else {
      console.log('❌ Frontend API failed');
      try {
        const errorData = await frontendResponse.json();
        console.log('Error response:', errorData);
      } catch (e) {
        console.log('Could not parse error response');
      }
    }

    // Step 4: Check if token is being properly forwarded
    console.log('\n4. Checking token forwarding...');
    console.log('Token length:', token.length);
    console.log('Token format check:', token.split('.').length === 3 ? 'Valid JWT format' : 'Invalid JWT format');
    
    // Test with a malformed token to see if that's the issue
    console.log('\n5. Testing with various token formats...');
    
    // Test with token that has extra whitespace
    const tokenWithSpaces = ` ${token} `;
    const spaceTestResponse = await fetch('http://localhost:4000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenWithSpaces}`,
      },
      body: JSON.stringify({
        front: 'Space Test',
        back: 'Testing with spaces',
        difficulty: 3
      }),
    });
    console.log('Token with spaces status:', spaceTestResponse.status);

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugFrontendTokenIssue();