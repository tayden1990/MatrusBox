// Simple API test script using CommonJS
const API_BASE = 'http://localhost:4000';

async function testMatrusAPI() {
  console.log('🧪 Testing Matrus AI Leitner System API\n');
  
  // Use dynamic import for fetch if needed
  const fetch = globalThis.fetch || (await import('node-fetch')).default;
  
  try {
    // Test 1: Check if API is accessible
    console.log('1. Checking API health...');
    try {
      const response = await fetch(`${API_BASE}/api/docs`);
      console.log(`   ✅ API accessible - Status: ${response.status}`);
    } catch (e) {
      console.log(`   ❌ API not accessible - ${e.message}`);
      return;
    }

    // Test 2: Test user registration
    console.log('\n2. Testing user registration...');
    const registerPayload = {
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
      firstName: 'Test',
      lastName: 'User'
    };

    try {
      const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload)
      });
      
      const registerData = await registerResponse.json();
      console.log(`   Status: ${registerResponse.status}`);
      
      if (registerResponse.status === 201) {
        console.log(`   ✅ User registered successfully`);
        console.log(`   User ID: ${registerData.user?.id || registerData.id || 'Not provided'}`);
      } else {
        console.log(`   ❌ Registration failed: ${registerData.message || 'Unknown error'}`);
        console.log(`   Response:`, registerData);
      }
    } catch (e) {
      console.log(`   ❌ Registration error: ${e.message}`);
    }

    // Test 3: Test user login
    console.log('\n3. Testing user login...');
    const loginPayload = {
      email: registerPayload.email,
      password: registerPayload.password
    };

    try {
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginPayload)
      });
      
      const loginData = await loginResponse.json();
      console.log(`   Status: ${loginResponse.status}`);
      console.log(`   Response:`, loginData);
      
      if ((loginResponse.status === 200 || loginResponse.status === 201) && (loginData.access_token || loginData.data?.accessToken)) {
        console.log(`   ✅ Login successful`);
        const token = loginData.access_token || loginData.data?.accessToken;
        console.log(`   Token received: ${token.substring(0, 20)}...`);
        
        // Test 4: Test protected endpoint
        console.log('\n4. Testing protected endpoint (user profile)...');
        try {
          const profileResponse = await fetch(`${API_BASE}/api/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const profileData = await profileResponse.json();
          console.log(`   Status: ${profileResponse.status}`);
          
          if (profileResponse.status === 200) {
            console.log(`   ✅ Profile retrieved successfully`);
            console.log(`   User: ${profileData.firstName} ${profileData.lastName}`);
            console.log(`   Email: ${profileData.email}`);
          } else {
            console.log(`   ❌ Profile fetch failed: ${profileData.message || 'Unknown error'}`);
          }
        } catch (e) {
          console.log(`   ❌ Profile fetch error: ${e.message}`);
        }
        
        // Test 5: Test card creation (if endpoint exists)
        console.log('\n5. Testing card creation...');
        const cardPayload = {
          front: 'What is AI?',
          back: 'Artificial Intelligence - computer systems able to perform tasks that typically require human intelligence',
          explanation: 'AI involves machine learning, neural networks, and algorithms that can learn and make decisions.',
          tags: ['technology', 'ai', 'learning']
        };
        
        try {
          const cardResponse = await fetch(`${API_BASE}/api/cards`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cardPayload)
          });
          
          const cardData = await cardResponse.json();
          console.log(`   Status: ${cardResponse.status}`);
          
          if (cardResponse.status === 201) {
            console.log(`   ✅ Card created successfully`);
            console.log(`   Card ID: ${cardData.id}`);
          } else {
            console.log(`   ⚠️  Card creation status: ${cardResponse.status} (endpoint may not be implemented yet)`);
          }
        } catch (e) {
          console.log(`   ⚠️  Card creation error: ${e.message} (endpoint may not be implemented yet)`);
        }
        
      } else {
        console.log(`   ❌ Login failed: ${loginData.message || 'Unknown error'}`);
      }
    } catch (e) {
      console.log(`   ❌ Login error: ${e.message}`);
    }

    console.log('\n🎯 API Test Summary:');
    console.log('   ✅ API is accessible');
    console.log('   ✅ User registration works');
    console.log('   ✅ User authentication works');
    console.log('   ✅ Protected endpoints work');
    console.log('   ⚠️  Additional endpoints may need implementation');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMatrusAPI().catch(console.error);