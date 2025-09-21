import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TelegramService } from './telegram.service';
import { TelegramWebhookDto, MiniAppAuthDto } from './dto/telegram.dto';

@ApiTags('Telegram')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  @ApiOperation({
    summary: 'Handle Telegram webhook events',
    description: 'Processes incoming webhook events from Telegram Bot API',
  })
  @ApiBody({
    type: TelegramWebhookDto,
    description:
      'Telegram webhook payload containing bot updates and user interactions',
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  handleWebhook(@Body() body: TelegramWebhookDto) {
    // TODO: Implement Telegram webhook event handling
    return this.telegramService.handleWebhook(body);
  }

  @Post('mini-app-auth')
  @ApiOperation({
    summary: 'Authenticate Telegram mini-app user',
    description: 'Authenticates users through Telegram mini-app integration',
  })
  @ApiBody({
    type: MiniAppAuthDto,
    description:
      'Telegram mini-app authentication data including user ID and authorization payload',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @ApiResponse({ status: 400, description: 'Invalid authentication data' })
  async miniAppAuth(@Body() body: MiniAppAuthDto) {
    return this.telegramService.miniAppAuth(body.telegramId, body.payload);
  }
}
