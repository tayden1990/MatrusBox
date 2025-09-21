#!/usr/bin/env node

/**
 * Mock API Server for MatrusBox Development
 * This provides a temporary API that mimics the NestJS backend
 * when Prisma/database is not available
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'demo@matrus.com',
    username: 'demo_user',
    firstName: 'Demo',
    lastName: 'User',
    createdAt: new Date().toISOString(),
  }
];

const mockCards = [
  {
    id: '1',
    front: 'Hello',
    back: 'Hola',
    userId: '1',
    language: 'spanish',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    front: 'Goodbye',
    back: 'Adiós',
    userId: '1',
    language: 'spanish',
    difficulty: 'beginner',
    createdAt: new Date().toISOString(),
  }
];

const mockStats = {
  totalCards: 45,
  cardsToReview: 12,
  cardsLearned: 33,
  streakDays: 7,
  averageAccuracy: 0.87,
  timeStudiedToday: 1800, // 30 minutes in seconds
  progressData: [
    { date: '2024-01-01', cardsStudied: 10, accuracy: 0.8 },
    { date: '2024-01-02', cardsStudied: 15, accuracy: 0.85 },
    { date: '2024-01-03', cardsStudied: 12, accuracy: 0.9 },
  ]
};

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'demo@matrus.com' && password === 'demo') {
    res.json({
      success: true,
      data: {
        user: mockUsers[0],
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials. Use demo@matrus.com / demo'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  const newUser = {
    id: Date.now().toString(),
    email,
    firstName,
    lastName,
    username: email.split('@')[0],
    createdAt: new Date().toISOString(),
  };
  
  mockUsers.push(newUser);
  
  res.json({
    success: true,
    data: {
      user: newUser,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now()
    }
  });
});

app.post('/api/auth/telegram-register', (req, res) => {
  const { telegramId, firstName, lastName, username } = req.body;
  
  const newUser = {
    id: Date.now().toString(),
    telegramId,
    firstName,
    lastName,
    username,
    createdAt: new Date().toISOString(),
  };
  
  mockUsers.push(newUser);
  
  res.json({
    success: true,
    data: newUser
  });
});

// User endpoints
app.get('/api/users/telegram/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  const user = mockUsers.find(u => u.telegramId === telegramId);
  
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
});

app.get('/api/users/me', (req, res) => {
  res.json({
    success: true,
    data: mockUsers[0]
  });
});

// Cards endpoints
app.get('/api/cards', (req, res) => {
  res.json({
    success: true,
    data: mockCards
  });
});

app.post('/api/cards', (req, res) => {
  const { front, back, language, difficulty } = req.body;
  
  const newCard = {
    id: Date.now().toString(),
    front,
    back,
    language: language || 'english',
    difficulty: difficulty || 'beginner',
    userId: '1',
    createdAt: new Date().toISOString(),
  };
  
  mockCards.push(newCard);
  
  res.json({
    success: true,
    data: newCard
  });
});

app.get('/api/cards/today/:userId', (req, res) => {
  res.json({
    success: true,
    data: mockCards.slice(0, 5) // Return first 5 cards for today's study
  });
});

// Analytics endpoints
app.get('/api/analytics/progress', (req, res) => {
  res.json({
    success: true,
    data: mockStats.progressData
  });
});

app.get('/api/analytics/activity', (req, res) => {
  res.json({
    success: true,
    data: {
      dailyActivity: mockStats.progressData,
      weeklyTrends: [
        { week: 'Week 1', cardsStudied: 70, accuracy: 0.85 },
        { week: 'Week 2', cardsStudied: 89, accuracy: 0.87 },
        { week: 'Week 3', cardsStudied: 95, accuracy: 0.89 },
        { week: 'Week 4', cardsStudied: 103, accuracy: 0.91 },
      ]
    }
  });
});

app.get('/api/analytics/retention', (req, res) => {
  res.json({
    success: true,
    data: {
      retentionRates: [
        { interval: '1 day', rate: 0.95 },
        { interval: '3 days', rate: 0.87 },
        { interval: '1 week', rate: 0.78 },
        { interval: '2 weeks', rate: 0.65 },
        { interval: '1 month', rate: 0.45 },
      ]
    }
  });
});

app.get('/api/analytics/global', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 1247,
      totalCards: 15670,
      totalStudySessions: 8934,
      averageAccuracy: 0.83,
      mostStudiedLanguages: [
        { language: 'Spanish', count: 4521 },
        { language: 'French', count: 3890 },
        { language: 'German', count: 2845 },
        { language: 'Italian', count: 2134 },
        { language: 'Portuguese', count: 1876 },
      ]
    }
  });
});

// Study endpoints
app.get('/api/study/stats/:userId', (req, res) => {
  res.json({
    success: true,
    data: mockStats
  });
});

app.post('/api/study/session/start', (req, res) => {
  res.json({
    success: true,
    data: {
      sessionId: 'session-' + Date.now(),
      cardsToStudy: mockCards.slice(0, 3)
    }
  });
});

app.post('/api/study/session/:sessionId/end', (req, res) => {
  res.json({
    success: true,
    data: {
      sessionComplete: true,
      cardsStudied: 3,
      accuracy: 0.87
    }
  });
});

app.post('/api/study/answer', (req, res) => {
  const { cardId, isCorrect, timeSpent, userAnswer } = req.body;
  
  res.json({
    success: true,
    data: {
      cardId,
      isCorrect,
      nextReview: new Date(Date.now() + (isCorrect ? 86400000 : 3600000)).toISOString(), // 1 day if correct, 1 hour if wrong
      confidence: isCorrect ? 'high' : 'low'
    }
  });
});

// AI endpoints
app.post('/api/ai/generate-card', (req, res) => {
  const { prompt, language, difficulty } = req.body;
  
  // Mock AI generated card
  const aiCard = {
    front: prompt || 'How to say "computer" in Spanish?',
    back: 'Computadora / Ordenador',
    explanation: 'Both terms are commonly used. "Computadora" is more common in Latin America, while "ordenador" is preferred in Spain.',
    pronunciation: '/kom.pu.taˈdo.ɾa/',
    exampleSentence: 'Mi computadora nueva es muy rápida.',
    difficulty: difficulty || 'intermediate',
    language: language || 'spanish'
  };
  
  res.json({
    success: true,
    data: aiCard
  });
});

// Telegram endpoints
app.post('/api/telegram/webhook', (req, res) => {
  console.log('Telegram webhook received:', req.body);
  res.json({ status: 'received', body: req.body });
});

app.post('/api/telegram/mini-app-auth', (req, res) => {
  const { telegramId, payload } = req.body;
  res.json({ success: true, telegramId });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MatrusBox Mock API',
    timestamp: new Date().toISOString(),
    environment: 'development',
    database: 'mock',
    version: '1.0.0-mock'
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.send(`
    <html>
      <head><title>MatrusBox Mock API Documentation</title></head>
      <body style="font-family: Arial, sans-serif; margin: 40px;">
        <h1>MatrusBox Mock API Server</h1>
        <p><strong>Status:</strong> Running on port ${PORT}</p>
        <p><strong>Mode:</strong> Development/Demo</p>
        
        <h2>Available Endpoints:</h2>
        <ul>
          <li><strong>GET</strong> /api/health - Health check</li>
          <li><strong>POST</strong> /api/auth/login - User login (demo@matrus.com / demo)</li>
          <li><strong>POST</strong> /api/auth/register - User registration</li>
          <li><strong>GET</strong> /api/users/me - Get current user</li>
          <li><strong>GET</strong> /api/cards - Get all cards</li>
          <li><strong>POST</strong> /api/cards - Create new card</li>
          <li><strong>GET</strong> /api/analytics/* - Various analytics endpoints</li>
          <li><strong>POST</strong> /api/ai/generate-card - AI card generation (mock)</li>
          <li><strong>POST</strong> /api/study/* - Study session management</li>
        </ul>
        
        <h2>Demo Credentials:</h2>
        <p><strong>Email:</strong> demo@matrus.com</p>
        <p><strong>Password:</strong> demo</p>
        
        <p><em>This is a mock API server for development purposes.</em></p>
      </body>
    </html>
  `);
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/api/docs');
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler  
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    availableEndpoints: [
      'GET /api/health',
      'GET /api/docs', 
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET /api/cards',
      'POST /api/cards',
      'GET /api/analytics/*'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MatrusBox Mock API Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`💡 Demo credentials: demo@matrus.com / demo`);
  console.log(`🔧 Mode: Development/Demo (Prisma-free)`);
});

module.exports = app;