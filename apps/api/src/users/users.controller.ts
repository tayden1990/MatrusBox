import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UserResponseDto,
  UserStatsResponseDto,
  UserSettingsResponseDto,
  UserSettingsUpdateDto,
} from './dto/users.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves detailed user information by user ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user-123-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get('telegram/:telegramId')
  @ApiOperation({
    summary: 'Get user by Telegram ID',
    description: 'Retrieves user information using their Telegram ID',
  })
  @ApiParam({
    name: 'telegramId',
    description: 'Telegram user ID',
    example: '123456789',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserByTelegramId(@Param('telegramId') telegramId: string) {
    return this.usersService.findByTelegramId(telegramId);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Get user statistics',
    description:
      'Retrieves comprehensive learning statistics for a user including progress, streaks, and performance metrics',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user-123-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserStats(@Param('id') id: string) {
    const stats = await this.usersService.getUserStats(id);
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id/settings')
  @ApiOperation({
    summary: 'Get user settings',
    description: 'Retrieves user preferences and configuration settings',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user-123-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'User settings retrieved successfully',
    type: UserSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserSettings(@Param('id') id: string) {
    const settings = await this.usersService.getSettings(id);
    return {
      success: true,
      data: settings,
    };
  }

  @Post(':id/settings')
  @ApiOperation({
    summary: 'Update user settings',
    description: 'Updates user preferences and configuration settings',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'user-123-uuid-456',
  })
  @ApiBody({
    type: UserSettingsUpdateDto,
    description:
      'Settings to update including notifications, language, timezone, and study preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
    type: UserSettingsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Invalid settings data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserSettings(
    @Param('id') id: string,
    @Body() settings: UserSettingsUpdateDto
  ) {
    const updatedSettings = await this.usersService.updateSettings(
      id,
      settings
    );
    return {
      success: true,
      data: updatedSettings,
    };
  }
}
