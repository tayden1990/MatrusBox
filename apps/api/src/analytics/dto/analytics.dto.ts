import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserIdQueryDto {
  @ApiProperty({
    description: 'User ID to get analytics for',
    example: 'user-123-uuid-456',
  })
  @IsString()
  userId: string;
}

export class CardIdQueryDto {
  @ApiProperty({
    description: 'Card ID to get performance analytics for',
    example: 'card-123-uuid-456',
  })
  @IsString()
  cardId: string;
}
