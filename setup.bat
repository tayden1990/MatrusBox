@echo off
:: Matrus Development Setup Script for Windows
:: This script sets up the development environment for the Matrus project

echo 🚀 Setting up Matrus development environment...

:: Check if required tools are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install it first.
    exit /b 1
)

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ pnpm is not installed. Please install it first.
    exit /b 1
)

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install it first.
    exit /b 1
)

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install it first.
    exit /b 1
)

echo ✅ Prerequisites check passed

:: Install dependencies
echo 📦 Installing dependencies...
pnpm install

:: Copy environment file
echo ⚙️ Setting up environment...
if not exist .env (
    copy .env.example .env
    echo 📝 Created .env file from .env.example
    echo ⚠️  Please update the .env file with your actual configuration values
)

:: Start Docker services
echo 🐳 Starting Docker services...
docker-compose up -d postgres redis

:: Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

:: Run database migrations
echo 🗄️ Running database migrations...
cd apps\api
pnpm db:generate
pnpm db:migrate
cd ..\..

echo 🎉 Setup complete!
echo.
echo 📖 Next steps:
echo 1. Update your .env file with actual values:
echo    - OPENAI_API_KEY (for AI features)
echo    - TELEGRAM_BOT_TOKEN (for bot functionality)
echo    - JWT secrets (for security)
echo.
echo 2. Start the development servers:
echo    pnpm dev
echo.
echo 3. Access the applications:
echo    - Web app: http://localhost:3000
echo    - API docs: http://localhost:4000/api/docs
echo    - Database UI: pnpm --filter=@matrus/api db:studio
echo.
echo 4. Check the README.md for more detailed instructions
echo.
echo Happy coding! 🚀