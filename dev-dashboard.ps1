# MatrusBox Development Dashboard
# Quick commands for development workflow

# Development Server Management
function Start-DevServer {
    Write-Host "🚀 Starting MatrusBox Development Environment..." -ForegroundColor Green
    .\run-dev.bat
}

function Stop-DevServer {
    Write-Host "🛑 Stopping development servers..." -ForegroundColor Yellow
    Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.CommandLine -like "*matrus*"} | Stop-Process -Force
    docker-compose stop
    Write-Host "✅ All services stopped" -ForegroundColor Green
}

function Restart-DevServer {
    Write-Host "🔄 Restarting development environment..." -ForegroundColor Blue
    Stop-DevServer
    Start-Sleep -Seconds 3
    Start-DevServer
}

# Individual Service Management
function Start-API {
    Write-Host "🔧 Starting API server only..." -ForegroundColor Cyan
    pnpm --filter=@matrus/api dev
}

function Start-Web {
    Write-Host "🌐 Starting web application only..." -ForegroundColor Cyan
    pnpm --filter=@matrus/web dev
}

function Start-Mobile {
    Write-Host "📱 Starting mobile application..." -ForegroundColor Cyan
    pnpm --filter=@matrus/mobile dev
}

function Start-Database {
    Write-Host "🗄️ Starting database services..." -ForegroundColor Cyan
    docker-compose up -d postgres redis
}

# Testing Functions
function Test-API {
    Write-Host "🧪 Running API tests..." -ForegroundColor Magenta
    node test-all-features.js
}

function Test-Comprehensive {
    Write-Host "🧪 Running comprehensive tests..." -ForegroundColor Magenta
    node comprehensive-test.js
}

function Test-Frontend {
    Write-Host "🧪 Opening frontend testing guide..." -ForegroundColor Magenta
    Write-Host "Copy and paste the following into your browser console at http://localhost:3000:" -ForegroundColor Yellow
    Get-Content .\frontend-test.js
}

# Database Management
function Show-DatabaseLogs {
    Write-Host "📋 Database logs:" -ForegroundColor Yellow
    docker-compose logs postgres redis
}

function Reset-Database {
    Write-Host "⚠️ Resetting database (this will delete all data)..." -ForegroundColor Red
    $confirm = Read-Host "Are you sure? Type 'yes' to continue"
    if ($confirm -eq "yes") {
        docker-compose down -v
        docker-compose up -d postgres redis
        Start-Sleep -Seconds 10
        pnpm --filter=@matrus/api run db:migrate
        Write-Host "✅ Database reset complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Database reset cancelled" -ForegroundColor Yellow
    }
}

# Development Utilities
function Open-DevURLs {
    Write-Host "🌐 Opening development URLs..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:4000/api/docs"
}

function Show-DevStatus {
    Write-Host "📊 Development Environment Status" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    
    # Check if services are running
    $apiRunning = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
    $webRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    
    Write-Host "API Server (4000): " -NoNewline
    if ($apiRunning) { Write-Host "✅ Running" -ForegroundColor Green } else { Write-Host "❌ Stopped" -ForegroundColor Red }
    
    Write-Host "Web App (3000): " -NoNewline
    if ($webRunning) { Write-Host "✅ Running" -ForegroundColor Green } else { Write-Host "❌ Stopped" -ForegroundColor Red }
    
    Write-Host ""
    Write-Host "Docker Services:" -ForegroundColor Yellow
    docker-compose ps
}

function Watch-Logs {
    param(
        [string]$Service = "all"
    )
    
    switch ($Service.ToLower()) {
        "api" { 
            Write-Host "👀 Watching API logs..." -ForegroundColor Cyan
            # This would need to be implemented based on your logging setup
        }
        "web" { 
            Write-Host "👀 Watching Web logs..." -ForegroundColor Cyan
            # This would need to be implemented based on your logging setup
        }
        "database" { 
            Write-Host "👀 Watching Database logs..." -ForegroundColor Cyan
            docker-compose logs -f postgres redis
        }
        default {
            Write-Host "👀 Watching all service logs..." -ForegroundColor Cyan
            docker-compose logs -f
        }
    }
}

# Quick Development Commands
function Quick-Fix {
    Write-Host "🔧 Running quick fixes..." -ForegroundColor Yellow
    Write-Host "  - Clearing Next.js cache..."
    Remove-Item -Recurse -Force "apps\web\.next" -ErrorAction SilentlyContinue
    Write-Host "  - Reinstalling dependencies..."
    pnpm install
    Write-Host "✅ Quick fixes applied" -ForegroundColor Green
}

function Dev-Help {
    Write-Host ""
    Write-Host "🚀 MatrusBox Development Commands" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Main Commands:" -ForegroundColor Yellow
    Write-Host "  Start-DevServer      - Start complete development environment"
    Write-Host "  Stop-DevServer       - Stop all development services"
    Write-Host "  Restart-DevServer    - Restart development environment"
    Write-Host "  Show-DevStatus       - Show status of all services"
    Write-Host ""
    Write-Host "🎯 Individual Services:" -ForegroundColor Yellow
    Write-Host "  Start-API            - Start only API server"
    Write-Host "  Start-Web            - Start only web application"
    Write-Host "  Start-Mobile         - Start mobile application"
    Write-Host "  Start-Database       - Start database services"
    Write-Host ""
    Write-Host "🧪 Testing:" -ForegroundColor Yellow
    Write-Host "  Test-API             - Run API tests"
    Write-Host "  Test-Comprehensive   - Run full test suite"
    Write-Host "  Test-Frontend        - Show frontend testing guide"
    Write-Host ""
    Write-Host "🗄️ Database:" -ForegroundColor Yellow
    Write-Host "  Show-DatabaseLogs    - View database logs"
    Write-Host "  Reset-Database       - Reset database (⚠️ deletes data)"
    Write-Host ""
    Write-Host "🛠️ Utilities:" -ForegroundColor Yellow
    Write-Host "  Open-DevURLs         - Open development URLs in browser"
    Write-Host "  Watch-Logs [service] - Watch logs (api/web/database/all)"
    Write-Host "  Quick-Fix            - Clear caches and reinstall deps"
    Write-Host "  Dev-Help             - Show this help"
    Write-Host ""
    Write-Host "💡 Usage Examples:" -ForegroundColor Cyan
    Write-Host "  Start-DevServer                    # Start everything"
    Write-Host "  Watch-Logs database                # Watch database logs"
    Write-Host "  Test-API                           # Test API endpoints"
    Write-Host ""
}

# Show help on import
Write-Host ""
Write-Host "🎉 MatrusBox Development Dashboard Loaded!" -ForegroundColor Green
Write-Host "Type 'Dev-Help' to see all available commands" -ForegroundColor Cyan
Write-Host "Type 'Start-DevServer' to begin development" -ForegroundColor Yellow
Write-Host ""