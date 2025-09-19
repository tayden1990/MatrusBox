# 🚀 MatrusBox Development Scripts

This folder contains powerful development scripts that make it easy to develop, test, and monitor your MatrusBox application.

## 🎯 Quick Start

### Option 1: Interactive Development Manager (Recommended)
```bash
node dev-manager.js
```
This opens an interactive menu where you can:
- Start/stop all services with one click
- Run tests and view results
- Monitor service status
- Access development tools
- Get guided help

### Option 2: One-Click Startup
**Windows:**
```cmd
run-dev.bat
```

**Linux/Mac:**
```bash
chmod +x run-dev.sh
./run-dev.sh
```

### Option 3: PowerShell Development Dashboard
```powershell
. .\dev-dashboard.ps1
Start-DevServer
```

## 📋 Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `dev-manager.js` | Interactive development manager | `node dev-manager.js` |
| `run-dev.bat` | Windows one-click startup | `run-dev.bat` |
| `run-dev.sh` | Linux/Mac one-click startup | `./run-dev.sh` |
| `dev-dashboard.ps1` | PowerShell functions | `. .\dev-dashboard.ps1` |
| `status-checker.js` | Quick status check | `node status-checker.js` |

## 🛠️ What These Scripts Do

### 1. **Start All Services**
- ✅ Start PostgreSQL and Redis databases
- ✅ Start NestJS API server (port 4000)
- ✅ Start Next.js web application (port 3000)
- ✅ Open development URLs in browser

### 2. **Development Tools**
- 🧪 Run comprehensive API tests
- 📊 Monitor service status in real-time
- 📋 View logs from all services
- 🔄 Restart services individually
- 🧹 Clean build caches

### 3. **Database Management**
- 🗄️ Reset database with confirmation
- 📦 Run migrations automatically
- 🔍 View database logs

### 4. **Testing Suite**
- ✅ Backend API testing
- ✅ Frontend integration testing
- ✅ WebSocket functionality testing
- ✅ Database connectivity testing

## 🌐 Development URLs

Once services are running, you can access:

- **Web Application:** http://localhost:3000
- **API Server:** http://localhost:4000
- **API Documentation:** http://localhost:4000/api/docs
- **Database:** localhost:5432 (PostgreSQL)
- **Cache:** localhost:6379 (Redis)

## 🎯 Common Development Workflows

### Starting Fresh Development Session
1. Run `node dev-manager.js`
2. Select "Start All Services"
3. Wait for services to initialize
4. Open browser tabs automatically
5. Begin coding!

### Testing Changes
1. Make code changes (auto-reload enabled)
2. Use dev manager to run tests
3. Check API docs for backend changes
4. Test frontend in browser

### Debugging Issues
1. Use dev manager to view logs
2. Check service status
3. Restart individual services if needed
4. Reset database if data issues

### Performance Monitoring
1. Check status regularly
2. Monitor logs for errors
3. Use comprehensive tests
4. Profile with browser tools

## 🔧 Customization

You can modify these scripts to:
- Add new services or ports
- Change startup order
- Add custom tests
- Modify logging output
- Add deployment commands

## 🆘 Troubleshooting

### Services Won't Start
- Check if Docker is running
- Verify ports aren't in use
- Run `node status-checker.js`
- Try cleaning build files

### Database Issues
- Reset database with dev manager
- Check Docker container logs
- Verify environment variables

### Frontend Issues
- Clear Next.js cache
- Restart web service only
- Check browser console

## 💡 Pro Tips

1. **Use the interactive manager** - it's the most user-friendly option
2. **Keep terminals open** - you can see real-time logs
3. **Test frequently** - automated tests catch issues early
4. **Monitor status** - know when services go down
5. **Use browser dev tools** - essential for frontend debugging

## 🎉 Happy Coding!

These scripts are designed to make your development experience smooth and productive. Focus on building amazing features while the scripts handle the infrastructure!

For more help, run the interactive dev manager and select "Show Development Guide".