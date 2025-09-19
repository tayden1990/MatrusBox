import axios, { AxiosInstance } from 'axios';
import type { User, Card, StudyStats } from '@matrus/common-types';

export interface CreateUserFromTelegramData {
  telegramId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface SubmitAnswerData {
  cardId: string;
  isCorrect: boolean;
  timeSpent: number;
  userAnswer?: string;
}

export class ApiService {
  private api: AxiosInstance;

  constructor() {
    const baseURL = process.env.API_URL || 'http://localhost:4000';
    
    this.api = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getUserByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const response = await this.api.get(`/users/telegram/${telegramId}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createUserFromTelegram(userData: CreateUserFromTelegramData): Promise<User> {
    const response = await this.api.post('/auth/telegram-register', userData);
    return response.data.data;
  }

  async getTodaysCards(userId: string): Promise<Card[]> {
    const response = await this.api.get(`/study/today?userId=${userId}`);
    return response.data.data || [];
  }

  async getUserStats(userId: string): Promise<StudyStats> {
    const response = await this.api.get(`/users/${userId}/stats`);
    return response.data.data;
  }

  async submitAnswer(userId: string, answerData: SubmitAnswerData): Promise<void> {
    await this.api.post('/study/answer', {
      userId,
      ...answerData,
    });
  }

  async startStudySession(userId: string): Promise<{ sessionId: string }> {
    const response = await this.api.post('/study/session/start', { userId });
    return response.data.data;
  }

  async endStudySession(sessionId: string): Promise<void> {
    await this.api.post('/study/session/end', { sessionId });
  }
}