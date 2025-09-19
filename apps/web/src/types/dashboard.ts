// Analytics Type Definitions
export interface UserProgressData {
  learnedCards: number;
  successRate?: number;
  timeSpent?: number;
  streakDays?: number;
}

export interface UserActivityData {
  sessions: StudySession[];
  totalSessions?: number;
  averageSessionTime?: number;
  lastSessionDate?: string;
}

export interface StudySession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  cardsStudied?: number;
  correctAnswers?: number;
  totalAnswers?: number;
}

export interface GlobalStatsData {
  users: number;
  cards: number;
  sessions: number;
  totalLearningTime?: number;
}

export interface RetentionData {
  sessions: number;
  streak: number;
  weeklyActivity?: number[];
  monthlyActivity?: number[];
}

export interface AnalyticsData {
  progress?: UserProgressData;
  activity?: UserActivityData;
  globalStats?: GlobalStatsData;
  retention?: RetentionData;
}

export interface NotificationData {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  userId?: string;
}

export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}