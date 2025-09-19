@echo off
:: MatrusBox Development Environment Startup Script
:: This script starts all services needed for development

echo.
echo =====================================
echo    MatrusBox Development Startup
echo =====================================
echo.

:: Check if Docker is running
echo [1/6] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)
echo ✅ Docker is running

:: Start database services
echo.
echo [2/6] Starting database services...
docker-compose up -d postgres redis
if %errorlevel% neq 0 (
    echo ❌ Failed to start database services
    pause
    exit /b 1
)
echo ✅ Database services started

:: Wait for databases to be ready
echo.
echo [3/6] Waiting for databases to be ready...
timeout /t 10 /nobreak >nul
echo ✅ Databases should be ready

:: Install dependencies if needed
echo.
echo [4/6] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    pnpm install
)
echo ✅ Dependencies ready

:: Start API server in new window
echo.
echo [5/6] Starting API server...
start "MatrusBox API" cmd /k "cd /d %cd% && pnpm --filter=@matrus/api dev"
timeout /t 5 /nobreak >nul

:: Start Web application in new window
echo.
echo [6/6] Starting web application...
start "MatrusBox Web" cmd /k "cd /d %cd% && pnpm --filter=@matrus/web dev"

:: Wait a moment for services to start
echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak >nul

:: Display service information
echo.
echo =====================================
echo       🎉 DEVELOPMENT READY! 🎉
echo =====================================
echo.
echo 📱 Web Application:     http://localhost:3000
echo 🔧 API Server:          http://localhost:4000
echo 📚 API Documentation:   http://localhost:4000/api/docs
echo 🗄️  Database Admin:      http://localhost:5050 (if pgAdmin is running)
echo.
echo =====================================
echo        DEVELOPMENT COMMANDS
echo =====================================
echo.
echo To run individual services:
echo   pnpm --filter=@matrus/api dev     (API server)
echo   pnpm --filter=@matrus/web dev     (Web app)
echo   pnpm --filter=@matrus/mobile dev  (Mobile app)
echo.
echo To run tests:
echo   node test-all-features.js         (API tests)
echo   node comprehensive-test.js        (Full tests)
echo.
echo To check logs:
echo   docker-compose logs postgres      (Database logs)
echo   docker-compose logs redis         (Cache logs)
echo.
echo To restart services:
echo   run-dev.bat                       (This script)
echo   docker-compose restart            (Database services)
echo.
echo Press any key to open monitoring dashboard...
pause >nul

:: Open monitoring URLs
echo.
echo Opening development URLs...
start http://localhost:3000
start http://localhost:4000/api/docs
echo.
echo ✅ Development environment is ready!
echo ✅ Check the opened browser tabs to monitor your application
echo.
pause