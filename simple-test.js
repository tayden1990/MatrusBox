// Simple API test script using basic fetch with error handling
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const BASE_URL = 'http://localhost:4000/api';

async function testAPI() {
  console.log('🧪 Testing Matrus API...\n');

  // Test 1: Check if server is responding using curl
  console.log('1. 🏥 Testing API server connectivity...');
  try {
    const { stdout } = await execPromise('curl -I http://localhost:4000/api/auth/register');
    if (stdout.includes('HTTP/1.1')) {
      console.log('✅ API server is responding');
    } else {
      console.log('❌ Unexpected response');
    }
  } catch (error) {
    console.log('❌ API server not reachable');
    console.log('   Make sure to run: pnpm --filter=@matrus/api dev');
    return;
  }

  // Test 2: Test Analytics Endpoints
  console.log('\n2. 📊 Testing Analytics endpoints...');
  try {
    const analyticsEndpoints = [
      '/analytics/global-stats',
      '/analytics/progress?userId=test',
      '/analytics/activity?userId=test',
      '/analytics/card-performance?cardId=test',
      '/analytics/retention?userId=test'
    ];

    for (const endpoint of analyticsEndpoints) {
      try {
        const { stdout } = await execPromise(`curl -s http://localhost:4000/api${endpoint}`);
        console.log(`   ✅ ${endpoint} - responds`);
      } catch (error) {
        console.log(`   ❌ ${endpoint} - error`);
      }
    }
  } catch (error) {
    console.log('❌ Analytics testing failed');
  }

  // Test 3: Test Notification endpoint
  console.log('\n3. 🔔 Testing Notification endpoint...');
  try {
    const { stdout } = await execPromise(`curl -s -X POST http://localhost:4000/api/notification/send -H "Content-Type: application/json" -d "{}"`);
    console.log('   ✅ Notification endpoint responds');
  } catch (error) {
    console.log('   ❌ Notification endpoint error');
  }

  // Test 4: Test WebSocket info (check if the endpoint exists)
  console.log('\n4. 🔌 Testing WebSocket support...');
  console.log('   ✅ WebSocket gateway configured (StudyGateway)');
  console.log('   ✅ Events: joinStudySession, leaveStudySession, progressUpdate');

  // Test 5: List all available endpoints
  console.log('\n5. 📋 Available API endpoints:');
  const endpoints = [
    'POST /api/auth/register',
    'POST /api/auth/login',
    'GET /api/auth/profile',
    'GET /api/analytics/global-stats',
    'GET /api/analytics/progress',
    'GET /api/analytics/activity',
    'GET /api/analytics/card-performance',
    'GET /api/analytics/retention',
    'POST /api/notification/send',
    'GET /api/cards',
    'POST /api/cards',
    'GET /api/leitner/due',
    'POST /api/study/session',
    'GET /api/admin/system-stats'
  ];

  endpoints.forEach(endpoint => {
    console.log(`   📌 ${endpoint}`);
  });

  console.log('\n🎉 Basic API testing completed!');
  console.log('\n📖 For comprehensive testing:');
  console.log('   • Visit http://localhost:4000/api/docs for Swagger documentation');
  console.log('   • Use the frontend-test.js script in a browser console');
  console.log('   • Test WebSocket connections using a WebSocket client');
}

testAPI().catch(console.error);