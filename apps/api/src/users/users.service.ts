import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        locale: true,
        timezone: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByTelegramId(telegramId: string) {
    return this.prisma.user.findUnique({
      where: { telegramId },
      select: {
        id: true,
        email: true,
        telegramId: true,
        firstName: true,
        lastName: true,
        locale: true,
        timezone: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async getUserStats(userId: string) {
    // Get user's study statistics
    const [totalCards, cardsToReview, studySessions] = await Promise.all([
      this.prisma.card.count({ where: { userId } }),
      this.prisma.leitnerCard.count({
        where: {
          card: { userId },
          nextReviewAt: { lte: new Date() },
        },
      }),
      this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 30, // Last 30 sessions
      }),
    ]);

    // Calculate stats
    const cardsLearned = await this.prisma.leitnerCard.count({
      where: {
        card: { userId },
        boxLevel: { gte: 4 }, // Cards in higher boxes are considered "learned"
      },
    });

    const totalReviews = studySessions.reduce(
      (sum, session) => sum + session.cardsAttempted,
      0,
    );
    const correctReviews = studySessions.reduce(
      (sum, session) => sum + session.cardsCorrect,
      0,
    );

    const averageAccuracy = totalReviews > 0 ? correctReviews / totalReviews : 0;

    // Calculate streak
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let streakDays = 0;
    let currentDate = new Date(todayStart);
    
    while (streakDays < 365) { // Max 365 days to prevent infinite loop
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasSessionThisDay = studySessions.some(
        session => session.startedAt >= dayStart && session.startedAt <= dayEnd
      );
      
      if (hasSessionThisDay) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Time studied today
    const timeStudiedToday = studySessions
      .filter(session => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate >= todayStart;
      })
      .reduce((sum, session) => sum + session.totalTimeSpent, 0);

    return {
      totalCards,
      cardsToReview,
      cardsLearned,
      streakDays,
      averageAccuracy,
      timeStudiedToday,
    };
  }

  async updateSettings(userId: string, settings: any) {
    return this.prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: {
        userId,
        ...settings,
      },
    });
  }

  async getSettings(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: { userId },
    });
  }
}