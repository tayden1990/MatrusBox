import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TelegramWebhookDto {
  @ApiProperty({ 
    description: 'Unique identifier for the update',
    example: '123456789'
  })
  @IsString()
  updateId: string;

  @ApiProperty({ 
    description: 'Telegram message object containing update data',
    example: {
      message_id: 123,
      from: { id: 987654321, first_name: 'John' },
      chat: { id: 987654321, type: 'private' },
      date: 1629123456,
      text: '/start'
    }
  })
  @IsObject()
  message: Record<string, any>;
}

export class MiniAppAuthDto {
  @ApiProperty({ 
    description: 'Telegram user ID',
    example: '123456789'
  })
  @IsString()
  telegramId: string;

  @ApiProperty({ 
    description: 'Authentication payload from Telegram mini-app',
    example: {
      auth_date: 1629123456,
      hash: 'abc123def456',
      user: { id: 123456789, first_name: 'John' }
    }
  })
  @IsObject()
  payload: Record<string, any>;
}
