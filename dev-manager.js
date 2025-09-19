// Interactive Development Manager for MatrusBox
const { spawn, exec } = require('child_process');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');

class MatrusBoxDevManager {
  constructor() {
    this.services = new Map();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async init() {
    console.clear();
    this.showWelcome();
    await this.checkPrerequisites();
    this.showMainMenu();
  }

  showWelcome() {
    console.log(chalk.blue(figlet.textSync('MatrusBox', { horizontalLayout: 'full' })));
    console.log(chalk.green('🚀 Interactive Development Manager\n'));
  }

  async checkPrerequisites() {
    console.log(chalk.yellow('📋 Checking prerequisites...\n'));
    
    const checks = [
      { name: 'Docker', command: 'docker --version' },
      { name: 'Node.js', command: 'node --version' },
      { name: 'pnpm', command: 'pnpm --version' }
    ];

    for (const check of checks) {
      try {
        await this.execCommand(check.command);
        console.log(chalk.green(`✅ ${check.name} is available`));
      } catch (error) {
        console.log(chalk.red(`❌ ${check.name} is not available`));
        process.exit(1);
      }
    }
    console.log('');
  }

  showMainMenu() {
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log(chalk.cyan('           DEVELOPMENT MENU           '));
    console.log(chalk.cyan('═══════════════════════════════════════'));
    console.log('');
    console.log(chalk.white('🚀 Service Management:'));
    console.log('  1. Start All Services');
    console.log('  2. Start API Only');
    console.log('  3. Start Web Only');
    console.log('  4. Start Database Only');
    console.log('  5. Stop All Services');
    console.log('');
    console.log(chalk.white('🧪 Testing:'));
    console.log('  6. Run API Tests');
    console.log('  7. Run Comprehensive Tests');
    console.log('  8. Open Frontend Test Guide');
    console.log('');
    console.log(chalk.white('🛠️ Development Tools:'));
    console.log('  9. Show Service Status');
    console.log('  10. View Logs');
    console.log('  11. Reset Database');
    console.log('  12. Clean Build Files');
    console.log('');
    console.log(chalk.white('🌐 Quick Access:'));
    console.log('  13. Open Development URLs');
    console.log('  14. Show Development Guide');
    console.log('');
    console.log('  0. Exit');
    console.log('');

    this.rl.question(chalk.yellow('Select an option (0-14): '), (answer) => {
      this.handleMenuChoice(parseInt(answer));
    });
  }

  async handleMenuChoice(choice) {
    console.log('');
    
    switch (choice) {
      case 1:
        await this.startAllServices();
        break;
      case 2:
        await this.startAPI();
        break;
      case 3:
        await this.startWeb();
        break;
      case 4:
        await this.startDatabase();
        break;
      case 5:
        await this.stopAllServices();
        break;
      case 6:
        await this.runAPITests();
        break;
      case 7:
        await this.runComprehensiveTests();
        break;
      case 8:
        this.showFrontendTestGuide();
        break;
      case 9:
        await this.showServiceStatus();
        break;
      case 10:
        await this.viewLogs();
        break;
      case 11:
        await this.resetDatabase();
        break;
      case 12:
        await this.cleanBuildFiles();
        break;
      case 13:
        this.openDevelopmentURLs();
        break;
      case 14:
        this.showDevelopmentGuide();
        break;
      case 0:
        await this.exit();
        return;
      default:
        console.log(chalk.red('Invalid option. Please try again.'));
    }

    this.waitForInput();
  }

  async startAllServices() {
    console.log(chalk.green('🚀 Starting all services...\n'));
    
    try {
      // Start databases first
      console.log(chalk.yellow('📦 Starting database services...'));
      await this.execCommand('docker-compose up -d postgres redis');
      console.log(chalk.green('✅ Database services started\n'));
      
      // Wait for databases
      console.log(chalk.yellow('⏳ Waiting for databases to be ready...'));
      await this.sleep(10000);
      
      // Start API
      console.log(chalk.yellow('🔧 Starting API server...'));
      this.startService('api', 'pnpm --filter=@matrus/api dev');
      
      // Start Web
      console.log(chalk.yellow('🌐 Starting web application...'));
      this.startService('web', 'pnpm --filter=@matrus/web dev');
      
      await this.sleep(5000);
      
      console.log(chalk.green('\n🎉 All services started successfully!'));
      console.log(chalk.cyan('📱 Web App: http://localhost:3000'));
      console.log(chalk.cyan('🔧 API: http://localhost:4000'));
      console.log(chalk.cyan('📚 API Docs: http://localhost:4000/api/docs'));
      
    } catch (error) {
      console.log(chalk.red(`❌ Error starting services: ${error.message}`));
    }
  }

  async startAPI() {
    console.log(chalk.green('🔧 Starting API server only...\n'));
    await this.startDatabase();
    await this.sleep(5000);
    this.startService('api', 'pnpm --filter=@matrus/api dev');
    console.log(chalk.cyan('🔧 API: http://localhost:4000'));
  }

  async startWeb() {
    console.log(chalk.green('🌐 Starting web application only...\n'));
    this.startService('web', 'pnpm --filter=@matrus/web dev');
    console.log(chalk.cyan('📱 Web App: http://localhost:3000'));
  }

  async startDatabase() {
    console.log(chalk.green('🗄️ Starting database services...\n'));
    try {
      await this.execCommand('docker-compose up -d postgres redis');
      console.log(chalk.green('✅ Database services started'));
    } catch (error) {
      console.log(chalk.red(`❌ Error starting databases: ${error.message}`));
    }
  }

  async stopAllServices() {
    console.log(chalk.yellow('🛑 Stopping all services...\n'));
    
    // Stop Node.js services
    for (const [name, process] of this.services) {
      console.log(chalk.yellow(`Stopping ${name}...`));
      process.kill();
      this.services.delete(name);
    }
    
    // Stop Docker services
    try {
      await this.execCommand('docker-compose stop');
      console.log(chalk.green('✅ All services stopped'));
    } catch (error) {
      console.log(chalk.red(`❌ Error stopping services: ${error.message}`));
    }
  }

  async runAPITests() {
    console.log(chalk.magenta('🧪 Running API tests...\n'));
    try {
      await this.execCommand('node test-all-features.js');
    } catch (error) {
      console.log(chalk.red(`❌ Test failed: ${error.message}`));
    }
  }

  async runComprehensiveTests() {
    console.log(chalk.magenta('🧪 Running comprehensive tests...\n'));
    try {
      await this.execCommand('node comprehensive-test.js');
    } catch (error) {
      console.log(chalk.red(`❌ Test failed: ${error.message}`));
    }
  }

  showFrontendTestGuide() {
    console.log(chalk.magenta('🧪 Frontend Testing Guide\n'));
    console.log(chalk.yellow('1. Open your web browser'));
    console.log(chalk.yellow('2. Navigate to http://localhost:3000'));
    console.log(chalk.yellow('3. Open browser developer tools (F12)'));
    console.log(chalk.yellow('4. Copy and paste the content of frontend-test.js into the console'));
    console.log(chalk.yellow('5. Press Enter to run the tests'));
  }

  async showServiceStatus() {
    console.log(chalk.cyan('📊 Service Status\n'));
    
    // Check ports
    const ports = [3000, 4000, 5432, 6379];
    for (const port of ports) {
      const isOpen = await this.checkPort(port);
      const serviceName = this.getServiceNameByPort(port);
      console.log(`${serviceName}: ${isOpen ? chalk.green('✅ Running') : chalk.red('❌ Stopped')}`);
    }
    
    console.log('\n📦 Docker Services:');
    try {
      await this.execCommand('docker-compose ps');
    } catch (error) {
      console.log(chalk.red('❌ Error checking Docker services'));
    }
  }

  async viewLogs() {
    console.log(chalk.cyan('📋 Which logs would you like to view?\n'));
    console.log('1. API Logs');
    console.log('2. Web Logs');
    console.log('3. Database Logs');
    console.log('4. All Logs');
    
    this.rl.question(chalk.yellow('Select logs (1-4): '), async (answer) => {
      const choice = parseInt(answer);
      switch (choice) {
        case 1:
          console.log(chalk.cyan('📋 API Logs (showing running API process output)'));
          break;
        case 2:
          console.log(chalk.cyan('📋 Web Logs (showing running Web process output)'));
          break;
        case 3:
          await this.execCommand('docker-compose logs postgres redis');
          break;
        case 4:
          await this.execCommand('docker-compose logs');
          break;
        default:
          console.log(chalk.red('Invalid option'));
      }
      this.waitForInput();
    });
    return;
  }

  async resetDatabase() {
    console.log(chalk.red('⚠️ This will delete ALL data in the database!\n'));
    this.rl.question(chalk.yellow('Type "yes" to confirm: '), async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        try {
          console.log(chalk.yellow('🗄️ Resetting database...'));
          await this.execCommand('docker-compose down -v');
          await this.execCommand('docker-compose up -d postgres redis');
          await this.sleep(10000);
          await this.execCommand('pnpm --filter=@matrus/api run db:migrate');
          console.log(chalk.green('✅ Database reset complete'));
        } catch (error) {
          console.log(chalk.red(`❌ Error resetting database: ${error.message}`));
        }
      } else {
        console.log(chalk.yellow('❌ Database reset cancelled'));
      }
      this.waitForInput();
    });
    return;
  }

  async cleanBuildFiles() {
    console.log(chalk.yellow('🧹 Cleaning build files...\n'));
    try {
      await this.execCommand('rm -rf apps/web/.next apps/api/dist node_modules/.cache');
      console.log(chalk.green('✅ Build files cleaned'));
    } catch (error) {
      // Try Windows commands
      try {
        await this.execCommand('rmdir /s /q apps\\web\\.next 2>nul & rmdir /s /q apps\\api\\dist 2>nul');
        console.log(chalk.green('✅ Build files cleaned'));
      } catch (error2) {
        console.log(chalk.yellow('⚠️ Some files could not be cleaned (they may not exist)'));
      }
    }
  }

  openDevelopmentURLs() {
    console.log(chalk.green('🌐 Opening development URLs...\n'));
    
    const urls = [
      'http://localhost:3000',
      'http://localhost:4000/api/docs'
    ];
    
    urls.forEach(url => {
      console.log(chalk.cyan(`Opening: ${url}`));
      // Platform-specific URL opening
      const command = process.platform === 'win32' ? 'start' : 
                     process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${command} ${url}`);
    });
  }

  showDevelopmentGuide() {
    console.log(chalk.cyan('📖 MatrusBox Development Guide\n'));
    console.log(chalk.white('🔧 Architecture:'));
    console.log('  • Backend: NestJS API with TypeScript');
    console.log('  • Frontend: Next.js with React and Tailwind');
    console.log('  • Database: PostgreSQL with Prisma ORM');
    console.log('  • Cache: Redis for sessions and queues');
    console.log('  • Real-time: WebSocket for live updates');
    console.log('');
    console.log(chalk.white('📁 Project Structure:'));
    console.log('  • apps/api/ - Backend API server');
    console.log('  • apps/web/ - Frontend web application');
    console.log('  • apps/mobile/ - Mobile application');
    console.log('  • packages/ui/ - Shared UI components');
    console.log('  • packages/common-types/ - Shared TypeScript types');
    console.log('');
    console.log(chalk.white('🛠️ Development Workflow:'));
    console.log('  1. Start services with this manager');
    console.log('  2. Make changes to code (auto-reload enabled)');
    console.log('  3. Test changes in browser');
    console.log('  4. Run tests to verify functionality');
    console.log('  5. Use API docs for backend testing');
    console.log('');
    console.log(chalk.white('🔍 Key Features to Test:'));
    console.log('  • User authentication (register/login)');
    console.log('  • Card creation and management');
    console.log('  • Study sessions with Leitner algorithm');
    console.log('  • Analytics dashboard');
    console.log('  • Real-time notifications');
    console.log('  • AI-powered study assistance');
  }

  // Helper methods
  startService(name, command) {
    const process = spawn(command, { shell: true, stdio: 'pipe' });
    this.services.set(name, process);
    
    process.stdout.on('data', (data) => {
      console.log(chalk.gray(`[${name}] ${data.toString().trim()}`));
    });
    
    process.stderr.on('data', (data) => {
      console.log(chalk.red(`[${name}] ${data.toString().trim()}`));
    });
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          if (stdout) console.log(stdout);
          if (stderr) console.log(chalk.yellow(stderr));
          resolve(stdout);
        }
      });
    });
  }

  checkPort(port) {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      
      socket.setTimeout(1000);
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
      
      socket.connect(port, 'localhost');
    });
  }

  getServiceNameByPort(port) {
    const serviceMap = {
      3000: 'Web App (3000)',
      4000: 'API Server (4000)',
      5432: 'PostgreSQL (5432)',
      6379: 'Redis (6379)'
    };
    return serviceMap[port] || `Port ${port}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  waitForInput() {
    console.log('');
    this.rl.question(chalk.gray('Press Enter to return to menu...'), () => {
      console.clear();
      this.showMainMenu();
    });
  }

  async exit() {
    console.log(chalk.yellow('\n🛑 Shutting down development environment...'));
    await this.stopAllServices();
    console.log(chalk.green('👋 Goodbye! Happy coding!'));
    this.rl.close();
    process.exit(0);
  }
}

// Check if required packages are available
try {
  require('chalk');
  require('figlet');
} catch (error) {
  console.log('Installing required packages...');
  exec('npm install chalk figlet', (error) => {
    if (error) {
      console.log('Please install required packages: npm install chalk figlet');
      process.exit(1);
    } else {
      // Restart the script
      exec('node dev-manager.js');
    }
  });
  return;
}

// Start the development manager
const manager = new MatrusBoxDevManager();
manager.init().catch(console.error);