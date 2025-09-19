import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class BanUserDto {
  @ApiProperty({ 
    description: 'Reason for banning the user',
    example: 'Violation of terms of service',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ 
    summary: 'List all users (admin only)',
    description: 'Retrieves a complete list of all users in the system (requires admin privileges)'
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getAllUsers() {
    const users = await this.adminService.getAllUsers();
    return { users };
  }

  @Get('users/:id')
  @ApiOperation({ 
    summary: 'Get user details (admin only)',
    description: 'Retrieves detailed information about a specific user including admin-only data'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID',
    example: 'user-123-uuid-456'
  })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getUser(@Param('id') id: string) {
    const user = await this.adminService.getUser(id);
    return { user };
  }

  @Post('users/:id/ban')
  @ApiOperation({ 
    summary: 'Ban a user (admin only)',
    description: 'Bans a user from accessing the platform (requires admin privileges)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to ban',
    example: 'user-123-uuid-456'
  })
  @ApiBody({ 
    type: BanUserDto,
    description: 'Ban details including reason for administrative action and optional duration'
  })
  @ApiResponse({ status: 200, description: 'User banned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async banUser(@Param('id') id: string, @Body() body: BanUserDto) {
    return this.adminService.banUser(id, body.reason);
  }

  @Post('users/:id/unban')
  @ApiOperation({ 
    summary: 'Unban a user (admin only)',
    description: 'Removes the ban from a user account (requires admin privileges)'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to unban',
    example: 'user-123-uuid-456'
  })
  @ApiResponse({ status: 200, description: 'User unbanned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('system-stats')
  @ApiOperation({ 
    summary: 'Get system statistics (admin only)',
    description: 'Retrieves comprehensive system statistics including user counts, performance metrics, and platform health data'
  })
  @ApiResponse({ status: 200, description: 'System statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}
