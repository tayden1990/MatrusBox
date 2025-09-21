import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  CreateUserDto,
  LoginDto,
  TelegramLoginDto,
  UserProfileDto,
  TokenRefreshResponseDto,
} from './dto/auth.dto';
import { AuthResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register new user',
    description:
      'Creates a new user account and returns user details with authentication tokens',
  })
  @ApiBody({
    type: CreateUserDto,
    description:
      'User registration details including email, password, and optional profile information',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email already exists',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticates user credentials and returns authentication tokens',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials including email and password',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('telegram-login')
  @ApiOperation({
    summary: 'Login/register via Telegram',
    description:
      'Authenticates users through Telegram integration and creates account if needed',
  })
  @ApiBody({
    type: TelegramLoginDto,
    description:
      'Telegram authentication data including user ID, username, and validation hash',
  })
  @ApiResponse({
    status: 201,
    description: 'Telegram authentication successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid Telegram data' })
  async telegramLogin(@Body() telegramData: TelegramLoginDto) {
    return this.authService.telegramLogin(telegramData);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using a valid refresh token',
  })
  @ApiBody({
    description: 'Refresh token request',
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refreshToken'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: TokenRefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description:
      'Retrieves the profile information of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
