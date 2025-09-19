export interface User {
  id: string;
  email?: string;
  telegramId?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  locale: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  dailyGoal: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  studyReminders: string[]; // Array of reminder times
  preferredLanguage: string;
  difficultyPreference: 'easy' | 'medium' | 'hard' | 'adaptive';
}

export interface Card {
  id: string;
  userId: string;
  front: string;
  back: string;
  explanation?: string;
  exampleSentences: string[];
  tags: string[];
  media?: {
    audio?: string;
    image?: string;
  };
  difficulty: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

export interface LeitnerCard {
  id: string;
  cardId: string;
  boxLevel: number; // 1-5
  easeFactor: number; // SM-2 algorithm
  interval: number; // Days
  repetitions: number;
  lastReviewedAt?: Date;
  nextReviewAt: Date;
  totalReviews: number;
  correctReviews: number;
  consecutiveCorrect: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  cardsAttempted: number;
  cardsCorrect: number;
  totalTimeSpent: number; // seconds
  sessionType: 'review' | 'new' | 'mixed';
}

export interface StudyAnswer {
  id: string;
  sessionId: string;
  cardId: string;
  userAnswer?: string;
  isCorrect: boolean;
  timeSpent: number; // seconds
  difficulty?: number; // 1-5
  answeredAt: Date;
}

export interface PronunciationResult {
  id: string;
  userId: string;
  cardId: string;
  audioUrl?: string;
  score?: number; // 0-100
  feedback?: string;
  recordedAt: Date;
}

// Study-related types
export interface StudyCardData extends Card {
  leitnerCard: LeitnerCard;
}

export interface StudyStats {
  totalCards: number;
  cardsToReview: number;
  cardsLearned: number;
  streakDays: number;
  averageAccuracy: number;
  timeStudiedToday: number; // seconds
}

// Leitner system constants
export const LEITNER_INTERVALS = {
  1: 1,    // 1 day
  2: 3,    // 3 days
  3: 7,    // 1 week
  4: 14,   // 2 weeks
  5: 30,   // 1 month
};

export const EASE_FACTOR = {
  MIN: 1.3,
  DEFAULT: 2.5,
  MAX: 2.5,
  ADJUSTMENT: 0.15,
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string; // user id
  email?: string;
  telegramId?: string;
  iat: number;
  exp: number;
}

// Telegram types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface TelegramLoginData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// AI types
export interface AIGenerationRequest {
  type: 'example' | 'explanation' | 'pronunciation' | 'synonym';
  context: string;
  language?: string;
  difficulty?: number;
}

export interface AIGenerationResponse {
  content: string;
  confidence: number;
  tokensUsed?: number;
}

// WebSocket event types
export type SocketEventMap = {
  'study:start': { sessionId: string };
  'study:answer': { cardId: string; answer: string; timeSpent: number };
  'study:complete': { sessionId: string; stats: StudyStats };
  'card:update': { cardId: string };
  'progress:sync': { userId: string };
};