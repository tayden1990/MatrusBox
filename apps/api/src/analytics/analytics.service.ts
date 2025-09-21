import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    if (!userId) {
      throw new Error('User ID is required for dashboard stats');
    }

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Get actual database counts
    const [totalCards, sessionsToday, recentAnswers, leitnerCards] =
      await Promise.all([
        this.prisma.card.count({ where: { userId } }),
        this.prisma.studySession.count({
          where: {
            userId,
            startedAt: { gte: startOfDay },
          },
        }),
        this.prisma.studyAnswer.findMany({
          where: {
            session: { userId },
          },
          orderBy: { answeredAt: 'desc' },
          take: 30,
          select: {
            isCorrect: true,
            answeredAt: true,
          },
        }),
        this.prisma.leitnerCard.findMany({
          where: { userId },
          include: { card: true },
        }),
      ]);

    // Calculate accuracy from recent answers
    const accuracy =
      recentAnswers.length > 0
        ? Math.round(
            (recentAnswers.filter((a) => a.isCorrect).length /
              recentAnswers.length) *
              100
          )
        : 0;

    // Calculate current streak (simplified - days with study activity)
    let currentStreak = 0;
    const answersGroupedByDate = recentAnswers.reduce(
      (acc, answer) => {
        const date = answer.answeredAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const sortedDates = Object.keys(answersGroupedByDate).sort().reverse();
    for (const date of sortedDates) {
      if (answersGroupedByDate[date] > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate cards studied (total answers)
    const cardsStudied = recentAnswers.length;

    // Calculate due cards (cards due for review)
    const now = new Date();
    const dueCards = leitnerCards.filter(
      (leitnerCard) => leitnerCard.nextReviewAt <= now
    ).length;

    return {
      cardsStudied,
      sessionsToday,
      currentStreak,
      accuracy,
      totalCards,
      dueCards,
    };
  }

  async getRecentActivity(userId: string) {
    if (!userId) {
      throw new Error('User ID is required for recent activity');
    }

    // Get real activity data from database
    const [studySessions, recentCards, aiGenerations] = await Promise.all([
      this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          startedAt: true,
          endedAt: true,
          cardsAttempted: true,
          cardsCorrect: true,
          sessionType: true,
        },
      }),
      this.prisma.card.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          createdAt: true,
          front: true,
        },
      }),
      this.prisma.aIGeneration.findMany({
        where: { userId },
        orderBy: { generatedAt: 'desc' },
        take: 2,
        select: {
          id: true,
          generatedAt: true,
          requestType: true,
        },
      }),
    ]);

    const activities = [];

    // Add study session activities
    studySessions.forEach((session) => {
      const accuracy =
        session.cardsAttempted > 0
          ? Math.round((session.cardsCorrect / session.cardsAttempted) * 100)
          : 0;

      activities.push({
        id: session.id,
        type: 'study',
        description: `Completed ${session.sessionType} session`,
        timestamp: session.startedAt.toISOString(),
        score: accuracy,
        count: session.cardsAttempted,
      });
    });

    // Add card creation activities
    recentCards.forEach((card) => {
      activities.push({
        id: card.id,
        type: 'create',
        description: `Created card: ${card.front.substring(0, 30)}...`,
        timestamp: card.createdAt.toISOString(),
        count: 1,
      });
    });

    // Add AI generation activities
    aiGenerations.forEach((generation) => {
      activities.push({
        id: generation.id,
        type: 'ai_generate',
        description: `AI ${generation.requestType} generation`,
        timestamp: generation.generatedAt.toISOString(),
        count: 1,
      });
    });

    // Sort by timestamp and return latest 10
    return activities
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);
  }

  async getUserProgress(userId: string) {
    if (!userId) {
      throw new Error('User ID is required for user progress');
    }

    // Get real card and leitner data
    const [totalCards, leitnerStats, recentSessions] = await Promise.all([
      this.prisma.card.count({ where: { userId } }),
      this.prisma.leitnerCard.groupBy({
        by: ['boxLevel'],
        where: { userId },
        _count: true,
      }),
      this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 30,
      }),
    ]);

    // Calculate real progress metrics
    const learnedCards = leitnerStats
      .filter((stat) => stat.boxLevel >= 4)
      .reduce((sum, stat) => sum + stat._count, 0);
    const cardsInProgress = leitnerStats
      .filter((stat) => stat.boxLevel < 4)
      .reduce((sum, stat) => sum + stat._count, 0);

    // Calculate success rate from recent sessions
    const totalAnswers = recentSessions.reduce(
      (sum, session) => sum + (session.cardsAttempted || 0),
      0
    );
    const correctAnswers = recentSessions.reduce(
      (sum, session) => sum + (session.cardsCorrect || 0),
      0
    );
    const successRate =
      totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

    // Calculate total time spent (convert seconds to minutes)
    const timeSpent = recentSessions.reduce((sum, session) => {
      if (session.endedAt && session.startedAt) {
        return (
          sum +
          Math.floor(
            (session.endedAt.getTime() - session.startedAt.getTime()) /
              (1000 * 60)
          )
        );
      }
      return sum + Math.floor((session.totalTimeSpent || 0) / 60);
    }, 0);

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const hasSession = recentSessions.some((session) => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate.toDateString() === checkDate.toDateString();
      });
      if (hasSession) {
        currentStreak++;
      } else if (i > 0) {
        // Allow today to not have a session yet
        break;
      }
    }

    // Generate weekly progress from recent sessions
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const daysSessions = recentSessions.filter((session) => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate.toDateString() === date.toDateString();
      });

      const cardsStudied = daysSessions.reduce(
        (sum, session) => sum + (session.cardsAttempted || 0),
        0
      );
      const dayTotalAnswers = daysSessions.reduce(
        (sum, session) => sum + (session.cardsAttempted || 0),
        0
      );
      const dayCorrectAnswers = daysSessions.reduce(
        (sum, session) => sum + (session.cardsCorrect || 0),
        0
      );
      const daySuccessRate =
        dayTotalAnswers > 0
          ? Math.round((dayCorrectAnswers / dayTotalAnswers) * 100)
          : 0;

      return {
        date: date.toISOString().split('T')[0],
        cardsStudied: cardsStudied || 0,
        successRate: daySuccessRate || 0,
      };
    }).reverse();

    return {
      totalCards,
      cardsLearned: learnedCards,
      cardsInProgress,
      successRate,
      timeSpent,
      streakDays: currentStreak,
      weeklyProgress,
    };
  }

  async getUserActivity(userId: string) {
    if (!userId) {
      throw new Error('User ID is required for user activity');
    }

    try {
      // Get real study sessions
      const sessions = await this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 30,
      });

      // Generate real daily activity from sessions
      const dailyActivity = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const daySessions = sessions.filter((session) => {
          const sessionDate = new Date(session.startedAt);
          return sessionDate.toDateString() === date.toDateString();
        });

        const sessionsCount = daySessions.length;
        const timeSpent = daySessions.reduce((sum, session) => {
          if (session.endedAt && session.startedAt) {
            return (
              sum +
              Math.floor(
                (session.endedAt.getTime() - session.startedAt.getTime()) /
                  (1000 * 60)
              )
            );
          }
          return sum + Math.floor((session.totalTimeSpent || 0) / 60);
        }, 0);
        const cardsStudied = daySessions.reduce(
          (sum, session) => sum + (session.cardsAttempted || 0),
          0
        );

        return {
          date: date.toISOString().split('T')[0],
          sessionsCount,
          timeSpent,
          cardsStudied,
        };
      }).reverse();

      // Calculate average session time
      const totalSessionTime = sessions.reduce((sum, session) => {
        if (session.endedAt && session.startedAt) {
          return (
            sum +
            Math.floor(
              (session.endedAt.getTime() - session.startedAt.getTime()) /
                (1000 * 60)
            )
          );
        }
        return sum + Math.floor((session.totalTimeSpent || 0) / 60);
      }, 0);
      const averageSessionTime =
        sessions.length > 0
          ? Math.round(totalSessionTime / sessions.length)
          : 0;

      // Find most active hour (simplified - using start hour)
      const hourCounts = new Array(24).fill(0);
      sessions.forEach((session) => {
        const hour = new Date(session.startedAt).getHours();
        hourCounts[hour]++;
      });
      const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

      return {
        dailyActivity,
        averageSessionTime,
        mostActiveHour,
        totalSessions: sessions.length,
      };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw new Error('Failed to fetch user activity');
    }
  }

  async getGlobalStats() {
    try {
      // Get real global statistics from database
      const [users, cards, sessions] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.card.count(),
        this.prisma.studySession.count(),
      ]);

      // Calculate average retention from recent sessions
      const recentSessions = await this.prisma.studySession.findMany({
        where: {
          startedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        select: {
          cardsAttempted: true,
          cardsCorrect: true,
        },
      });

      let averageRetention = 75; // Default fallback
      if (recentSessions.length > 0) {
        const totalAttempted = recentSessions.reduce(
          (sum, session) => sum + (session.cardsAttempted || 0),
          0
        );
        const totalCorrect = recentSessions.reduce(
          (sum, session) => sum + (session.cardsCorrect || 0),
          0
        );
        if (totalAttempted > 0) {
          averageRetention = Math.round((totalCorrect / totalAttempted) * 100);
        }
      }

      return {
        totalUsers: users,
        totalCards: cards,
        totalSessions: sessions,
        averageRetention,
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      throw new Error('Failed to fetch global statistics');
    }
  }

  async getRetention(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      // Get user's study sessions
      const sessions = await this.prisma.studySession.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 100,
      });

      if (sessions.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          studyFrequency: 0,
          retentionRate: 0,
          weeklyConsistency: 0,
        };
      }

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const hasSession = sessions.some((session) => {
          const sessionDate = new Date(session.startedAt);
          return sessionDate.toDateString() === checkDate.toDateString();
        });
        if (hasSession) {
          currentStreak++;
        } else if (i > 0) {
          // Allow today to not have a session yet
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 0;
      const last90Days = Array.from({ length: 90 }, (_, i) => {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        return sessions.some((session) => {
          const sessionDate = new Date(session.startedAt);
          return sessionDate.toDateString() === date.toDateString();
        });
      });

      for (const hasSession of last90Days) {
        if (hasSession) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Calculate study frequency (sessions per week)
      const weeksOfData = Math.min(Math.ceil(sessions.length / 7), 12); // Max 12 weeks
      const studyFrequency =
        weeksOfData > 0
          ? Number((sessions.length / weeksOfData).toFixed(1))
          : 0;

      // Calculate retention rate (success rate)
      const totalAttempted = sessions.reduce(
        (sum, session) => sum + (session.cardsAttempted || 0),
        0
      );
      const totalCorrect = sessions.reduce(
        (sum, session) => sum + (session.cardsCorrect || 0),
        0
      );
      const retentionRate =
        totalAttempted > 0
          ? Number(((totalCorrect / totalAttempted) * 100).toFixed(1))
          : 0;

      // Calculate weekly consistency (percentage of weeks with at least 3 sessions)
      const last8Weeks = Array.from({ length: 8 }, (_, weekIndex) => {
        const weekStart = new Date(
          today.getTime() - (weekIndex + 1) * 7 * 24 * 60 * 60 * 1000
        );
        const weekEnd = new Date(
          today.getTime() - weekIndex * 7 * 24 * 60 * 60 * 1000
        );

        const weekSessions = sessions.filter((session) => {
          const sessionDate = new Date(session.startedAt);
          return sessionDate >= weekStart && sessionDate < weekEnd;
        });

        return weekSessions.length >= 3; // At least 3 sessions per week
      });

      const consistentWeeks = last8Weeks.filter(Boolean).length;
      const weeklyConsistency = Number(
        ((consistentWeeks / last8Weeks.length) * 100).toFixed(1)
      );

      return {
        currentStreak,
        longestStreak,
        studyFrequency,
        retentionRate,
        weeklyConsistency,
      };
    } catch (error) {
      console.error('Error fetching retention data:', error);
      throw new Error('Failed to fetch retention data');
    }
  }
}
