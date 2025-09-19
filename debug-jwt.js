// Enhanced debugging script for JWT authentication
async function debugJWTAuth() {
  try {
    console.log('🔍 JWT Authentication Debugging');
    console.log('================================');
    
    // Step 1: Login and get token
    console.log('\n1. Login and get token...');
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
    console.log('✅ Login successful');
    console.log('Token length:', token.length);
    
    // Step 2: Decode JWT payload (without verification)
    console.log('\n2. Decoding JWT payload...');
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('❌ Invalid JWT format');
      return;
    }
    
    try {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('JWT Payload:', payload);
      console.log('User ID:', payload.sub);
      console.log('Email:', payload.email);
      console.log('Issued at:', new Date(payload.iat * 1000));
      console.log('Expires at:', new Date(payload.exp * 1000));
      console.log('Current time:', new Date());
      console.log('Token expired?', payload.exp * 1000 < Date.now());
    } catch (e) {
      console.error('❌ Failed to decode JWT payload:', e.message);
    }

    // Step 3: Test direct backend API call
    console.log('\n3. Testing direct backend API call...');
    const backendResponse = await fetch('http://localhost:4000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        front: 'Debug Backend Card',
        back: 'Testing backend directly',
        explanation: 'Debug test',
        difficulty: 3
      }),
    });

    console.log('Backend response status:', backendResponse.status);
    const backendData = await backendResponse.json();
    console.log('Backend response:', backendData);

    // Step 4: Test the user validation endpoint
    console.log('\n4. Testing user validation...');
    const userResponse = await fetch('http://localhost:4000/api/users/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('User profile status:', userResponse.status);
    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('User profile:', userData);
    } else {
      const errorData = await userResponse.json();
      console.log('User profile error:', errorData);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugJWTAuth();