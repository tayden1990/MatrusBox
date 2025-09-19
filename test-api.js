// Simple API test script
const BASE_URL = 'http://localhost:4000';

async function testAPI() {
  console.log('🧪 Testing Matrus API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    
    // Test 2: Register a new user
    console.log('\n2. Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });
    
    console.log(`   Status: ${registerResponse.status}`);
    const registerResult = await registerResponse.json();
    console.log(`   Response:`, registerResult);
    
    // Test 3: Login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    const loginResult = await loginResponse.json();
    console.log(`   Response:`, loginResult);
    
    if (loginResult.access_token) {
      const token = loginResult.access_token;
      
      // Test 4: Get user profile
      console.log('\n4. Testing protected endpoint (user profile)...');
      const profileResponse = await fetch(`${BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`   Status: ${profileResponse.status}`);
      const profileResult = await profileResponse.json();
      console.log(`   Response:`, profileResult);
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
  }
}

// Run the test
testAPI();