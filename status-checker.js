// Quick status checker for MatrusBox services
const http = require('http');
const net = require('net');

class StatusChecker {
  constructor() {
    this.services = [
      { name: 'Web App', port: 3000, url: 'http://localhost:3000' },
      { name: 'API Server', port: 4000, url: 'http://localhost:4000' },
      { name: 'PostgreSQL', port: 5432, type: 'tcp' },
      { name: 'Redis', port: 6379, type: 'tcp' }
    ];
  }

  async checkAllServices() {
    console.log('🔍 MatrusBox Service Status Check');
    console.log('================================\n');

    for (const service of this.services) {
      const status = await this.checkService(service);
      const icon = status ? '✅' : '❌';
      const statusText = status ? 'Running' : 'Stopped';
      console.log(`${icon} ${service.name} (${service.port}): ${statusText}`);
    }

    console.log('\n📊 Quick Actions:');
    console.log('  node dev-manager.js     - Interactive development manager');
    console.log('  .\\run-dev.bat           - Start all services (Windows)');
    console.log('  ./run-dev.sh            - Start all services (Linux/Mac)');
    console.log('\n💡 If services are not running, use dev-manager.js to start them!');
  }

  checkService(service) {
    return new Promise((resolve) => {
      if (service.type === 'tcp') {
        // Check TCP connection for databases
        const socket = new net.Socket();
        socket.setTimeout(2000);
        
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
        
        socket.on('error', () => {
          resolve(false);
        });
        
        socket.connect(service.port, 'localhost');
      } else {
        // Check HTTP for web services
        const req = http.request(service.url, { timeout: 2000 }, (res) => {
          resolve(true);
        });
        
        req.on('error', () => {
          resolve(false);
        });
        
        req.on('timeout', () => {
          resolve(false);
        });
        
        req.end();
      }
    });
  }
}

const checker = new StatusChecker();
checker.checkAllServices();