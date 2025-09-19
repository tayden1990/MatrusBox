import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private analytics: AnalyticsService,
    private prisma: PrismaService
  ) {}

  @Get('progress')
  @ApiOperation({ 
    summary: 'Get user progress analytics',
    description: 'Returns detailed analytics about user learning progress including cards learned, success rates, and time spent'
  })
  @ApiQuery({ name: 'userId', description: 'User ID to get progress for', type: String, required: true })
  @ApiResponse({ status: 200, description: 'User progress analytics retrieved successfully' })
  async getProgress(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const data = await this.analytics.getUserProgress(userId);
    return { success: true, data };
  }

  @Get('activity')
  @ApiOperation({ 
    summary: 'Get user activity analytics',
    description: 'Returns user activity data including study sessions, time patterns, and engagement metrics'
  })
  @ApiQuery({ name: 'userId', description: 'User ID to get activity for', type: String, required: true })
  @ApiResponse({ status: 200, description: 'User activity analytics retrieved successfully' })
  async getActivity(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const data = await this.analytics.getUserActivity(userId);
    return { success: true, data };
  }

  @Public()
  @Get('global-stats')
  @ApiOperation({ 
    summary: 'Get global app statistics',
    description: 'Returns overall application statistics including total users, cards, sessions, and platform metrics'
  })
  @ApiResponse({ status: 200, description: 'Global statistics retrieved successfully' })
  async getGlobalStats() {
    const data = await this.analytics.getGlobalStats();
    return { success: true, data };
  }

  @Get('retention')
  @ApiOperation({ 
    summary: 'Get user retention analytics',
    description: 'Returns user retention metrics including streak data, learning consistency, and engagement patterns'
  })
  @ApiQuery({ name: 'userId', description: 'User ID to get retention for', type: String, required: true })
  @ApiResponse({ status: 200, description: 'User retention analytics retrieved successfully' })
  async getRetention(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const data = await this.analytics.getRetention(userId);
    return { success: true, data };
  }

  // Dashboard specific endpoints
  @Get('dashboard-stats')
  @ApiOperation({ 
    summary: 'Get dashboard statistics',
    description: 'Returns consolidated statistics for the main dashboard'
  })
  @ApiQuery({ name: 'userId', description: 'User ID to get stats for', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getDashboardStats(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const progress = await this.analytics.getUserProgress(userId);
    const globalStats = await this.analytics.getGlobalStats();
    
    const data = {
      totalCards: progress.totalCards || 0,
      masteredCards: progress.cardsLearned || 0,
      studyStreak: progress.streakDays || 0,
      totalUsers: globalStats.totalUsers || 0,
      accuracy: progress.successRate || 0
    };
    
    return { success: true, data };
  }

  @Get('recent-activity')
  @ApiOperation({ 
    summary: 'Get recent user activity',
    description: 'Returns recent activity data for the dashboard'
  })
  @ApiQuery({ name: 'userId', description: 'User ID to get activity for', type: String, required: true })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  async getRecentActivity(@Query('userId') userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const data = await this.analytics.getRecentActivity(userId);
    return { success: true, data };
  }
}
