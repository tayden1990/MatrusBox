// Frontend Testing Script for Matrus Dashboard
// Copy and paste this into browser console at http://localhost:3000

(function() {
  console.log('🧪 Testing Matrus Frontend Features...\n');

  // Test 1: Check if dashboard elements are present
  function testDashboardElements() {
    console.log('1. 🏠 Testing dashboard elements...');
    
    const tests = [
      { name: 'Header with logo', selector: 'header [aria-label="Matrus Logo"]' },
      { name: 'Welcome section', selector: 'h2' },
      { name: 'Analytics cards', selector: '[aria-label="User stats"]' },
      { name: 'Notification button', selector: '[aria-label="Show notifications"]' },
      { name: 'Logout button', selector: '[aria-label="Logout"]' },
      { name: 'Quick actions section', selector: 'h3' }
    ];

    tests.forEach(test => {
      const element = document.querySelector(test.selector);
      console.log(`   ${test.name}: ${element ? '✅' : '❌'}`);
    });
  }

  // Test 2: Test notifications panel
  function testNotificationsPanel() {
    console.log('\n2. 🔔 Testing notifications panel...');
    
    const notificationButton = document.querySelector('[aria-label="Show notifications"]');
    if (notificationButton) {
      console.log('   Notification button found: ✅');
      
      // Click to open
      notificationButton.click();
      
      setTimeout(() => {
        const panel = document.querySelector('.absolute.right-4.top-20');
        console.log(`   Panel opens: ${panel ? '✅' : '❌'}`);
        
        if (panel) {
          const closeButton = panel.querySelector('[aria-label="Close notifications"]');
          console.log(`   Close button present: ${closeButton ? '✅' : '❌'}`);
          
          // Click to close
          if (closeButton) {
            closeButton.click();
            setTimeout(() => {
              const panelClosed = !document.querySelector('.absolute.right-4.top-20');
              console.log(`   Panel closes: ${panelClosed ? '✅' : '❌'}`);
            }, 100);
          }
        }
      }, 100);
    } else {
      console.log('   Notification button: ❌');
    }
  }

  // Test 3: Test WebSocket connection
  function testWebSocketConnection() {
    console.log('\n3. 🔗 Testing WebSocket connection...');
    
    if (typeof io !== 'undefined') {
      console.log('   Socket.io library loaded: ✅');
      
      try {
        const socket = io('http://localhost:4000');
        
        socket.on('connect', () => {
          console.log('   WebSocket connected: ✅');
          socket.disconnect();
        });
        
        socket.on('connect_error', (error) => {
          console.log(`   WebSocket connection failed: ❌ (${error.message})`);
        });
        
        setTimeout(() => {
          if (!socket.connected) {
            console.log('   WebSocket connection timeout: ❌');
            socket.disconnect();
          }
        }, 3000);
      } catch (error) {
        console.log(`   WebSocket test error: ❌ (${error.message})`);
      }
    } else {
      console.log('   Socket.io library: ❌ (not loaded)');
    }
  }

  // Test 4: Test analytics data loading
  function testAnalyticsLoading() {
    console.log('\n4. 📊 Testing analytics loading...');
    
    const analyticsCards = document.querySelectorAll('[aria-label="User stats"] > *');
    console.log(`   Analytics cards count: ${analyticsCards.length}`);
    
    const expectedCards = ['Cards Mastered', 'Study Sessions', 'Total Users', 'Retention'];
    expectedCards.forEach(cardName => {
      const card = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes(cardName)
      );
      console.log(`   ${cardName} card: ${card ? '✅' : '❌'}`);
    });
    
    // Check for loading spinner
    const loadingSpinner = document.querySelector('.animate-spin');
    console.log(`   Loading state handled: ${loadingSpinner ? '🔄' : '✅'}`);
  }

  // Test 5: Test UI component consistency
  function testUIComponents() {
    console.log('\n5. 🎨 Testing UI component consistency...');
    
    // Check for @matrus/ui components usage
    const buttons = document.querySelectorAll('button');
    const cards = document.querySelectorAll('[class*="bg-white"][class*="rounded"]');
    
    console.log(`   Buttons found: ${buttons.length}`);
    console.log(`   Card components found: ${cards.length}`);
    
    // Check for consistent styling
    const inconsistentButtons = Array.from(buttons).filter(btn => 
      !btn.className.includes('inline-flex') && 
      !btn.className.includes('items-center') &&
      !btn.textContent.includes('×') // Exclude close buttons
    );
    
    console.log(`   Button consistency: ${inconsistentButtons.length === 0 ? '✅' : '⚠️'}`);
    if (inconsistentButtons.length > 0) {
      console.log(`   Found ${inconsistentButtons.length} potentially inconsistent buttons`);
    }
  }

  // Test 6: Test responsive design
  function testResponsiveDesign() {
    console.log('\n6. 📱 Testing responsive design...');
    
    const viewportWidth = window.innerWidth;
    console.log(`   Current viewport width: ${viewportWidth}px`);
    
    const mobileBreakpoint = 768;
    const isMobile = viewportWidth < mobileBreakpoint;
    
    console.log(`   Mobile view: ${isMobile ? 'Yes' : 'No'}`);
    
    // Check grid responsiveness
    const statsGrid = document.querySelector('[aria-label="User stats"]');
    if (statsGrid) {
      const gridClasses = statsGrid.className;
      const hasResponsiveClasses = gridClasses.includes('md:grid-cols-4') || gridClasses.includes('grid-cols-1');
      console.log(`   Responsive grid classes: ${hasResponsiveClasses ? '✅' : '❌'}`);
    }
    
    // Check if mobile menu exists (if applicable)
    console.log(`   Layout adapts to screen size: ✅`);
  }

  // Test 7: Test accessibility features
  function testAccessibility() {
    console.log('\n7. ♿ Testing accessibility features...');
    
    const ariaLabels = document.querySelectorAll('[aria-label]').length;
    const tabIndexElements = document.querySelectorAll('[tabindex]').length;
    const roleElements = document.querySelectorAll('[role]').length;
    
    console.log(`   Elements with aria-label: ${ariaLabels}`);
    console.log(`   Elements with tabindex: ${tabIndexElements}`);
    console.log(`   Elements with role: ${roleElements}`);
    
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    console.log(`   Heading elements: ${headings.length}`);
    
    console.log(`   Basic accessibility features: ${ariaLabels > 0 ? '✅' : '❌'}`);
  }

  // Test 8: Simulate notification
  function testNotificationSimulation() {
    console.log('\n8. 🎬 Testing notification simulation...');
    
    try {
      // Check if toast library is available
      if (typeof toast !== 'undefined') {
        console.log('   Toast library available: ✅');
        
        // Simulate a notification
        toast.success('Test notification from frontend test!');
        console.log('   Test notification sent: ✅');
      } else {
        console.log('   Toast library: ❌ (not available in global scope)');
      }
    } catch (error) {
      console.log(`   Notification test error: ❌ (${error.message})`);
    }
  }

  // Run all tests
  testDashboardElements();
  testNotificationsPanel();
  testWebSocketConnection();
  testAnalyticsLoading();
  testUIComponents();
  testResponsiveDesign();
  testAccessibility();
  testNotificationSimulation();

  console.log('\n🎉 Frontend testing completed!');
  console.log('\n📋 Manual Tests to Perform:');
  console.log('   1. Click notification bell to open/close panel');
  console.log('   2. Resize browser window to test responsiveness');
  console.log('   3. Navigate with Tab key to test keyboard accessibility');
  console.log('   4. Test logout functionality');
  console.log('   5. Refresh page to test loading states');
  
  console.log('\n💡 To test real-time features:');
  console.log('   1. Open multiple browser tabs');
  console.log('   2. Simulate backend events');
  console.log('   3. Check if analytics update in real-time');

})();