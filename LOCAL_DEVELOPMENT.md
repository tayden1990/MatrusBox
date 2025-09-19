# Matrus Local Development Guide

## 🚀 Quick Start

This guide helps you run the complete Matrus AI-powered Leitner System locally for development and testing.

## 📋 Prerequisites

- Node.js 20+ installed
- Docker Desktop running
- Git for version control
- VS Code (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Prisma
  - Docker

## 🗄️ Environment Setup

The project uses a shared `.env` file at the root with all configuration:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/matrus"

# JWT Configuration  
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Redis
REDIS_URL="redis://localhost:6379"

# API Configuration
API_URL="http://localhost:4000"
PORT=4000

# OpenAI Integration
OPENAI_API_KEY="sk-proj-your-actual-key-here"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
```

## 🐳 Step 1: Start Database Services

Start PostgreSQL and Redis containers:

```powershell
# From project root
docker-compose -f docker-compose.dev.yml up -d
```

**Expected Output:**
```
✅ Container matrus-postgres-1  Started
✅ Container matrus-redis-1     Started
```

**Verify Services:**
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

## 🔧 Step 2: Start API Server

```powershell
# Navigate to API directory and start server
cd E:\my-final-app\MatrusBox\apps\api
npx ts-node -r tsconfig-paths/register src/main.ts
```

**Expected Output:**
```
[Nest] Starting Nest application...
[Nest] AppModule dependencies initialized
[Nest] AuthModule dependencies initialized  
[Nest] Nest application successfully started
🚀 Matrus API is running on: http://localhost:4000
📚 API Documentation: http://localhost:4000/api/docs
```

**Available Endpoints:**
- API Base: `http://localhost:4000/api`
- Documentation: `http://localhost:4000/api/docs`
- Auth: `http://localhost:4000/api/auth/*`
- Users: `http://localhost:4000/api/users/*`

## 🌐 Step 3: Start Web Frontend

```powershell
# In a new terminal, navigate to web directory
cd E:\my-final-app\MatrusBox\apps\web
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.0.1
- Local: http://localhost:3000
✓ Ready in 3.9s
✓ Compiled /page in 2.1s
```

**Access Points:**
- Web App: `http://localhost:3000`
- Landing Page with AI-powered learning features
- Authentication flow
- Study interface

## ✅ Step 4: Verify Everything Works

### Database Check
```powershell
# Check containers are running
docker ps

# Should show matrus-postgres-1 and matrus-redis-1
```

### API Health Check
```powershell
# Test API documentation
Invoke-WebRequest -Uri http://localhost:4000/api/docs -Method GET
# Should return Status Code 200 with Swagger UI
```

### Web App Check
- Open browser to `http://localhost:3000`
- Should see Matrus landing page with:
  - "Master Languages with AI-Powered Spaced Repetition"
  - "Start Learning Free" and "Try Demo" buttons
  - Feature sections for Smart Scheduling, Multi-Platform, AI-Enhanced

## 🧪 Testing the System

### Authentication Flow Test
```powershell
# Test user registration
$body = @{
    email = "test@example.com"
    password = "testpassword123"
    username = "testuser"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/auth/register -Method POST -Body $body -ContentType "application/json"
```

### Login Test
```powershell
# Test user login
$loginBody = @{
    email = "test@example.com"
    password = "testpassword123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:4000/api/auth/login -Method POST -Body $loginBody -ContentType "application/json"
```

## 📁 Project Structure

```
MatrusBox/
├── apps/
│   ├── api/          # NestJS Backend API
│   ├── web/          # Next.js Frontend
│   ├── mobile/       # React Native App
│   └── bot/          # Telegram Bot
├── packages/
│   ├── common-types/ # Shared TypeScript types
│   ├── ui/           # Shared UI components
│   └── db/           # Database utilities
├── infra/
│   └── docker/       # Infrastructure configurations
└── .env              # Environment variables
```

## 🔄 Development Workflow

1. **Make Changes:** Edit code in respective app directories
2. **Hot Reload:** Both API and Web apps support hot reloading
3. **Test Changes:** Use API endpoints or web interface
4. **Database Updates:** Run `npx prisma migrate dev` in `apps/api`
5. **Add Dependencies:** Use `pnpm add <package>` in specific workspace

## 🛠️ Common Commands

```powershell
# Install dependencies
pnpm install

# Database operations
cd apps/api
npx prisma migrate dev     # Apply database migrations
npx prisma studio         # Open database GUI
npx prisma generate       # Generate Prisma client

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find process using port 4000
netstat -ano | findstr ":4000"

# Kill process (replace PID)
taskkill /F /PID <PID>
```

### Database Connection Issues
```powershell
# Reset database containers
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d
```

### API Module Errors
```powershell
# Clear node_modules and reinstall
cd apps/api
rm -rf node_modules
pnpm install
```

## 🌟 Key Features Implemented

- ✅ **JWT Authentication** with refresh tokens
- ✅ **PostgreSQL Database** with Prisma ORM
- ✅ **Redis Caching** for sessions and jobs
- ✅ **OpenAI Integration** for AI-powered content
- ✅ **Telegram Bot** integration framework
- ✅ **WebSocket Support** for real-time features
- ✅ **Swagger Documentation** for API exploration
- ✅ **Multi-platform Frontend** (Web, Mobile ready)
- ✅ **Leitner System Algorithm** for spaced repetition
- ✅ **Study Session Tracking** with progress analytics

## 🎯 Next Development Steps

1. **Implement Card Management:** Create, edit, delete flashcards
2. **Build Study Interface:** Interactive learning sessions
3. **Add AI Features:** Content generation, difficulty adjustment
4. **Mobile App Development:** React Native implementation
5. **Telegram Bot Features:** Study reminders, quick reviews
6. **Analytics Dashboard:** Progress tracking, statistics
7. **Multi-language Support:** International deployment

---

**🎉 Success!** Your Matrus AI-powered Leitner System is now running locally and ready for development!

**Access Points:**
- 🌐 Web App: http://localhost:3000
- 📚 API Docs: http://localhost:4000/api/docs
- 🗄️ Database: localhost:5432 (PostgreSQL)
- 📮 Cache: localhost:6379 (Redis)