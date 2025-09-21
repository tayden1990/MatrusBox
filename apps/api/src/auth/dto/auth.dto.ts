import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address for account creation and login',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
    description: 'User password with minimum 6 characters for account security',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John',
    required: false,
    description: 'User first name for profile display (optional)',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    required: false,
    description: 'User last name for profile display (optional)',
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address for authentication',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password for authentication',
  })
  @IsString()
  password: string;
}

export class TelegramLoginDto {
  @ApiProperty({
    example: 123456789,
    description: 'Telegram user ID for authentication',
  })
  @IsNumber()
  telegramId: number;

  @ApiProperty({
    example: 'John',
    description: 'User first name from Telegram profile',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    required: false,
    description: 'User last name from Telegram profile (optional)',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'johndoe',
    required: false,
    description: 'Telegram username (optional)',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    required: false,
    description: 'User profile photo URL from Telegram (optional)',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({
    example: 1234567890,
    description: 'Telegram authentication timestamp',
  })
  @IsNumber()
  authDate: number;

  @ApiProperty({
    example: 'abc123hash',
    description: 'Telegram authentication hash for validation',
  })
  @IsString()
  hash: string;
}

export class UserProfileDto {
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

export class TokenRefreshResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'New access token for API authentication',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'New refresh token for token renewal',
  })
  refreshToken: string;

  @ApiProperty({
    example: 3600,
    description: 'Token expiration time in seconds',
  })
  expiresIn: number;
}
