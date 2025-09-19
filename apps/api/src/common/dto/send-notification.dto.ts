import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel } from '../../common/utils/notification.service';

export class SendNotificationDto {
  @ApiProperty({ 
    description: 'ID of the user to send the notification to',
    example: 'user-123-uuid-456'
  })
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Message content to send',
    example: 'Your daily study reminder: Practice your flashcards!'
  })
  @IsString()
  message: string;

  @ApiProperty({ 
    description: 'Notification delivery channel',
    enum: ['email', 'telegram', 'push'],
    example: 'push'
  })
  @IsEnum(['email', 'telegram', 'push'])
  channel: NotificationChannel;
}

export class NotificationResponseDto {
  @ApiProperty({ 
    description: 'Indicates if the notification was sent successfully',
    example: true
  })
  success: boolean;

  @ApiProperty({ 
    description: 'The channel used for notification delivery',
    enum: ['email', 'telegram', 'push'],
    example: 'push'
  })
  channel: NotificationChannel;

  @ApiProperty({ 
    description: 'Error message if notification failed',
    example: 'Invalid email address',
    required: false
  })
  error?: string;
}
