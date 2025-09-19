// Using built-in fetch (Node 18+) or axios if available

async function testAuth() {
  try {
    console.log('🔐 Testing Authentication...');
    
    // Login to get token
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
    console.log('Login response status:', loginResponse.status);
    
    if (!loginData.success) {
      console.error('Login failed:', loginData);
      return;
    }

    const token = loginData.data.accessToken;
    console.log('✅ Login successful!');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');

    // Test creating a card with authentication via frontend API
    console.log('\n📝 Testing Card Creation via Frontend API...');
    const frontendCardResponse = await fetch('http://localhost:3000/api/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        front: 'Frontend Test Card',
        back: 'This card was created via the frontend API',
        explanation: 'Testing the frontend auth flow',
        difficulty: 4
      }),
    });

    const frontendCardData = await frontendCardResponse.json();
    console.log('Frontend card creation response status:', frontendCardResponse.status);
    
    if (frontendCardResponse.status === 201 && frontendCardData.success) {
      console.log('✅ Frontend card created successfully!');
      console.log('Card ID:', frontendCardData.data.id);
    } else {
      console.log('❌ Frontend card creation failed:');
      console.log('Response:', frontendCardData);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAuth();