import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    example: 'user-123-uuid-456',
    description: 'Unique user identifier',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    example: 123456789,
    description: 'Telegram user ID if connected',
    required: false,
  })
  telegramId?: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Account creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Last profile update timestamp',
  })
  updatedAt: Date;
}

export class UserStatsResponseDto {
  @ApiProperty({
    example: 150,
    description: 'Total number of cards created by user',
  })
  totalCards: number;

  @ApiProperty({
    example: 85,
    description: 'Number of cards learned (mastered)',
  })
  learnedCards: number;

  @ApiProperty({
    example: 42,
    description: 'Current study streak in days',
  })
  currentStreak: number;

  @ApiProperty({
    example: 89,
    description: 'Longest study streak in days',
  })
  longestStreak: number;

  @ApiProperty({
    example: 87.5,
    description: 'Overall accuracy percentage',
  })
  accuracy: number;

  @ApiProperty({
    example: 25,
    description: 'Total number of study sessions completed',
  })
  totalSessions: number;

  @ApiProperty({
    example: 320,
    description: 'Total study time in minutes',
  })
  totalStudyTime: number;

  @ApiProperty({
    example: 12.8,
    description: 'Average study time per session in minutes',
  })
  averageSessionTime: number;
}

export class UserSettingsResponseDto {
  @ApiProperty({
    example: true,
    description: 'Enable/disable notifications',
  })
  notifications: boolean;

  @ApiProperty({
    example: 'en',
    description: 'User interface language preference',
  })
  language: string;

  @ApiProperty({
    example: 'UTC',
    description: 'User timezone setting',
  })
  timezone: string;

  @ApiProperty({
    example: true,
    description: 'Enable/disable study reminders',
  })
  studyReminders: boolean;

  @ApiProperty({
    example: 20,
    description: 'Daily study goal in cards',
  })
  dailyGoal: number;

  @ApiProperty({
    example: 'spaced',
    description: 'Study mode preference',
    enum: ['spaced', 'intensive', 'review'],
  })
  studyMode: string;
}

export class UserSettingsUpdateDto {
  @ApiProperty({
    example: true,
    description: 'Enable/disable notifications',
    required: false,
  })
  notifications?: boolean;

  @ApiProperty({
    example: 'en',
    description: 'User interface language preference',
    required: false,
  })
  language?: string;

  @ApiProperty({
    example: 'UTC',
    description: 'User timezone setting',
    required: false,
  })
  timezone?: string;

  @ApiProperty({
    example: true,
    description: 'Enable/disable study reminders',
    required: false,
  })
  studyReminders?: boolean;

  @ApiProperty({
    example: 20,
    description: 'Daily study goal in cards',
    required: false,
  })
  dailyGoal?: number;

  @ApiProperty({
    example: 'spaced',
    description: 'Study mode preference',
    enum: ['spaced', 'intensive', 'review'],
    required: false,
  })
  studyMode?: string;
}
