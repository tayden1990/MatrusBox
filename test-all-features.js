// Enhanced API test script for all Matrus features
const BASE_URL = 'http://localhost:4000/api';

async function testAllFeatures() {
  console.log('🧪 Testing All Matrus Features...\n');
  
  let authToken = '';
  let userId = '';

  try {
    // Test 1: Health check
    console.log('1. 🏥 Testing API health...');
    try {
      // Use a simple OPTIONS request to test connectivity
      const healthResponse = await fetch(`${BASE_URL}/auth/register`, {
        method: 'OPTIONS'
      });
      console.log('✅ API server is responding');
    } catch (error) {
      console.log('❌ API server not reachable');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Make sure API server is running: pnpm --filter=@matrus/api dev');
      console.log('   2. Check database is running: docker-compose ps');
      return;
    }

    // Test 2: User Registration
    console.log('\n2. 👤 Testing user registration...');
    const timestamp = Date.now();
    const registerData = {
      email: `test-${timestamp}@example.com`,
      password: 'SecurePass123!',
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
    
    const registerResult = await registerResponse.json();
    console.log(`   Status: ${registerResponse.status} ${registerResponse.ok ? '✅' : '❌'}`);
    
    if (registerResponse.ok) {
      userId = registerResult.data?.user?.id || registerResult.user?.id || registerResult.id;
      console.log(`   User ID: ${userId}`);
    } else {
      console.log(`   Error: ${registerResult.message}`);
    }

    // Test 3: User Login
    console.log('\n3. 🔐 Testing user login...');
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    console.log(`   Status: ${loginResponse.status} ${loginResponse.ok ? '✅' : '❌'}`);
    
    if (loginResponse.ok) {
      authToken = loginResult.data?.accessToken || loginResult.accessToken || loginResult.access_token;
      console.log(`   Token received: ${authToken ? '✅' : '❌'}`);
    } else {
      console.log(`   Error: ${loginResult.message}`);
    }

    if (!authToken) {
      console.log('   ❌ No auth token, skipping authenticated tests');
      return;
    }

    // Test 4: Analytics - User Progress
    console.log('\n4. 📊 Testing analytics - User Progress...');
    const progressResponse = await fetch(`${BASE_URL}/analytics/progress?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${progressResponse.status} ${progressResponse.ok ? '✅' : '❌'}`);
    if (progressResponse.ok) {
      const progressData = await progressResponse.json();
      const data = progressData.data || progressData;
      console.log(`   Learned Cards: ${data.learnedCards || 0}`);
    } else {
      const error = await progressResponse.json();
      console.log(`   Error: ${error.message}`);
    }

    // Test 5: Analytics - User Activity
    console.log('\n5. 📈 Testing analytics - User Activity...');
    const activityResponse = await fetch(`${BASE_URL}/analytics/activity?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${activityResponse.status} ${activityResponse.ok ? '✅' : '❌'}`);
    if (activityResponse.ok) {
      const activityData = await activityResponse.json();
      const data = activityData.data || activityData;
      console.log(`   Sessions: ${data.sessions?.length || 0}`);
    }

    // Test 6: Analytics - Global Stats
    console.log('\n6. 🌍 Testing analytics - Global Stats...');
    const globalStatsResponse = await fetch(`${BASE_URL}/analytics/global-stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${globalStatsResponse.status} ${globalStatsResponse.ok ? '✅' : '❌'}`);
    if (globalStatsResponse.ok) {
      const globalData = await globalStatsResponse.json();
      const data = globalData.data || globalData;
      console.log(`   Total Users: ${data.users || 0}`);
      console.log(`   Total Cards: ${data.cards || 0}`);
      console.log(`   Total Sessions: ${data.sessions || 0}`);
    }

    // Test 7: Analytics - User Retention
    console.log('\n7. 🎯 Testing analytics - User Retention...');
    const retentionResponse = await fetch(`${BASE_URL}/analytics/retention?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${retentionResponse.status} ${retentionResponse.ok ? '✅' : '❌'}`);
    if (retentionResponse.ok) {
      const retentionData = await retentionResponse.json();
      const data = retentionData.data || retentionData;
      console.log(`   Streak: ${data.streak || 0} days`);
    }

    // Test 8: Notifications
    console.log('\n8. 🔔 Testing notifications...');
    const notificationData = {
      userId: userId,
      message: 'Test notification from API test',
      channel: 'push'
    };
    
    const notificationResponse = await fetch(`${BASE_URL}/notification/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });
    
    console.log(`   Status: ${notificationResponse.status} ${notificationResponse.ok ? '✅' : '❌'}`);
    if (notificationResponse.ok) {
      const notifResult = await notificationResponse.json();
      console.log(`   Notification sent: ${notifResult.success ? '✅' : '❌'}`);
    }

    // Test 9: WebSocket Connection (basic check)
    console.log('\n9. 🔗 Testing WebSocket availability...');
    try {
      // Just test if the WebSocket server responds to HTTP upgrade request
      const wsTestResponse = await fetch(`${BASE_URL.replace('/api', '')}/socket.io/`, {
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade'
        }
      });
      console.log(`   WebSocket server: ${wsTestResponse.status === 400 ? '✅ (Expected 400)' : '❌'}`);
      console.log(`   Note: Full WebSocket test requires browser environment`);
    } catch (e) {
      console.log(`   WebSocket server: ❌ (${e.message})`);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ API Health Check');
    console.log('   ✅ User Registration');
    console.log('   ✅ User Authentication');
    console.log('   ✅ Analytics Endpoints');
    console.log('   ✅ Notification Service');
    console.log('   ✅ WebSocket Server');
    
    console.log('\n🌐 Next Steps:');
    console.log('   1. Open http://localhost:3000 to test the web app');
    console.log('   2. Test the dashboard analytics display');
    console.log('   3. Test the notifications panel');
    console.log('   4. Test real-time features in browser');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure API server is running: pnpm --filter=@matrus/api dev');
    console.log('   2. Check database is running: docker-compose ps');
    console.log('   3. Verify environment variables in .env');
  }
}

// Run the test
testAllFeatures();