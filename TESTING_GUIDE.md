# Matrus Testing Guide

## 🚀 Quick Setup

### 1. Prerequisites
Make sure you have:
- Node.js (v18+)
- Docker and Docker Compose
- pnpm (recommended) or npm

### 2. Environment Setup
```powershell
# Run the setup script
.\setup.bat

# Or manually:
# 1. Copy environment file
copy .env.example .env

# 2. Install dependencies
pnpm install

# 3. Start Docker services
docker-compose -f docker-compose.dev.yml up -d

# 4. Run database migrations
cd apps\api
pnpm db:generate
pnpm db:migrate
cd ..\..
```

### 3. Start Development Servers
```powershell
# Start all services
pnpm dev

# Or start individually:
# API server (port 4000)
pnpm --filter=@matrus/api dev

# Web app (port 3000)
pnpm --filter=@matrus/web dev

# Bot service
pnpm --filter=@matrus/bot dev
```

## 🧪 Testing All Features

### A. Backend API Testing

#### 1. Basic API Health Check
```powershell
# Test if API is running
curl http://localhost:4000/health

# View API documentation
# Open: http://localhost:4000/api/docs
```

#### 2. Authentication Testing
```powershell
# Run the comprehensive API test
node test-comprehensive.js

# Or test manually:
# Register a user
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}"

# Login
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

#### 3. Analytics Endpoints Testing
```powershell
# Test analytics endpoints (need auth token)
# First get a token from login, then:

# User progress
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/analytics/progress?userId=USER_ID

# User activity
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/analytics/activity?userId=USER_ID

# Global stats
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/analytics/global-stats

# User retention
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/analytics/retention?userId=USER_ID
```

#### 4. WebSocket Testing
```javascript
// Test WebSocket connection (run in browser console on localhost:3000)
const socket = io('http://localhost:4000');
socket.on('connect', () => console.log('Connected to WebSocket'));
socket.emit('joinUserRoom', { userId: 'test-user-id' });
```

### B. Frontend Web App Testing

#### 1. Navigation & Authentication
1. Open http://localhost:3000
2. Test registration: Click "Get Started" → Fill form → Submit
3. Test login: Go to sign in → Enter credentials → Login
4. Test logout: Click logout button in dashboard

#### 2. Dashboard Features Testing

**Analytics Section:**
1. Login to dashboard
2. Verify analytics cards display (Cards Mastered, Study Sessions, Total Users, Retention)
3. Check loading states work
4. Verify error handling if API is down

**Notifications Panel:**
1. In dashboard, click the bell icon (🔔) in header
2. Verify notifications panel opens
3. Test closing with × button
4. Check empty state message displays

**Real-time Updates:**
1. Open dashboard in two browser tabs
2. In browser console, simulate notification:
   ```javascript
   // This would normally come from backend
   window.dispatchEvent(new CustomEvent('notification', {
     detail: { id: '1', message: 'Test notification', createdAt: new Date().toISOString() }
   }));
   ```

#### 3. Responsive Design Testing
1. Test on different screen sizes (mobile, tablet, desktop)
2. Verify UI components adapt properly
3. Check accessibility with screen reader or tab navigation

### C. UI Component Library Testing

#### 1. Component Consistency
1. Verify all buttons use @matrus/ui Button component
2. Check all cards use @matrus/ui Card component
3. Confirm loading spinners use @matrus/ui LoadingSpinner
4. Verify progress bars use @matrus/ui ProgressBar

#### 2. Shared Components Test
```powershell
# Build UI library
pnpm --filter=@matrus/ui build

# Test in web app
pnpm --filter=@matrus/web dev
```

### D. Database Testing

#### 1. Prisma Studio
```powershell
# Open database UI
cd apps\api
pnpm db:studio
# Opens at http://localhost:5555
```

#### 2. Database Schema Verification
1. Check Users table exists with proper fields
2. Verify Cards, StudySession, LeitnerCard tables
3. Test relationships between tables

### E. End-to-End Feature Testing

#### Complete User Journey:
1. **Registration Flow:**
   - Visit homepage → Register → Verify email redirect → Login

2. **Dashboard Experience:**
   - Login → View analytics → Test notifications → Check real-time updates

3. **Study Features:** (if implemented)
   - Create cards → Start study session → Submit answers → View progress

4. **AI Features:** (if implemented)
   - Generate cards with AI → Test AI suggestions

## 🐛 Debugging & Troubleshooting

### Common Issues:

#### 1. Database Connection Error
```powershell
# Check Docker containers
docker-compose ps

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

#### 2. API Not Starting
```powershell
# Check environment variables
cat .env

# Check API logs
pnpm --filter=@matrus/api dev
```

#### 3. Frontend Build Errors
```powershell
# Clear cache and reinstall
pnpm --filter=@matrus/web clean
pnpm --filter=@matrus/web install
pnpm --filter=@matrus/web dev
```

#### 4. WebSocket Connection Issues
- Verify NEXT_PUBLIC_WS_URL in .env
- Check browser network tab for WebSocket connection
- Ensure API server is running

### Useful Commands:

```powershell
# View all running processes
docker ps

# Check logs for specific service
docker-compose logs -f api

# Reset database
cd apps\api
pnpm db:reset

# Type checking
pnpm type-check

# Linting
pnpm lint

# Build all packages
pnpm build
```

## 📊 Feature Checklist

### ✅ Completed Features:
- [x] User authentication (register/login/logout)
- [x] Dashboard with analytics
- [x] Real-time notifications panel
- [x] WebSocket integration
- [x] Analytics API endpoints
- [x] Shared UI component library
- [x] Responsive design
- [x] Accessibility features
- [x] Modern UI/UX design

### 🔄 Test Each Feature:
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads with analytics
- [ ] Notifications panel opens/closes
- [ ] Real-time updates work
- [ ] Analytics API returns data
- [ ] WebSocket connects successfully
- [ ] UI components are consistent
- [ ] Mobile responsive design
- [ ] Accessibility features work

### 🚀 Ready for Production:
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] All tests pass
- [ ] UI/UX is polished
- [ ] Error handling works
- [ ] Loading states work
- [ ] Performance is acceptable

## 📈 Performance Testing

1. **Frontend Performance:**
   - Open Chrome DevTools → Lighthouse → Run audit
   - Check Core Web Vitals
   - Verify bundle sizes are reasonable

2. **API Performance:**
   - Test with multiple concurrent requests
   - Monitor database query performance
   - Check memory usage

3. **Real-time Features:**
   - Test with multiple WebSocket connections
   - Verify notifications don't cause memory leaks
   - Check update frequency is appropriate

Happy testing! 🎉