import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { NotificationService } from '../common/utils/notification.service';
import { SendNotificationDto, NotificationResponseDto } from '../common/dto/send-notification.dto';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  @ApiOperation({ 
    summary: 'Send a notification to a user via email, Telegram, or push',
    description: 'Delivers notifications through specified channels including email, Telegram, and push notifications'
  })
  @ApiBody({ 
    type: SendNotificationDto,
    description: 'Notification details including user ID, message content, and delivery channel'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Notification sent successfully',
    type: NotificationResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid notification data' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationService.sendNotification(dto.userId, dto.message, dto.channel);
  }
}
