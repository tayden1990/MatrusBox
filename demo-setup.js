// Demo user creation and login for testing
// This will create a test user and get a valid JWT token

const API_BASE_URL = 'http://localhost:4000';

async function createDemoUser() {
  try {
    // First try to register a demo user
    const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'demo@matrus.com',
        password: 'demo123456',
        name: 'Demo User'
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    // Then login to get a token
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'demo@matrus.com',
        password: 'demo123456'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginData.success && loginData.data.accessToken) {
      // Store the token for future use
      localStorage.setItem('authToken', loginData.data.accessToken);
      console.log('Demo token stored:', loginData.data.accessToken.substring(0, 20) + '...');
      return loginData.data.accessToken;
    }
  } catch (error) {
    console.error('Demo user creation failed:', error);
  }
}

// Run this in browser console to create demo user and get token
createDemoUser();