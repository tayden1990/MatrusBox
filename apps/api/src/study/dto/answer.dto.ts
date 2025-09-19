import { IsString, IsBoolean, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty({ 
    description: 'ID of the card being answered',
    example: 'card-123-uuid-456'
  })
  @IsString()
  cardId!: string;

  @ApiProperty({ 
    description: 'Whether the answer was correct',
    example: true
  })
  @IsBoolean()
  correct!: boolean;

  @ApiProperty({ 
    description: 'User\'s actual answer text',
    example: 'A pleasant surprise',
    required: false
  })
  @IsOptional()
  @IsString()
  userAnswer?: string;

  @ApiProperty({ 
    description: 'Time spent on this card in seconds',
    example: 15,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpent?: number; // seconds

  @ApiProperty({ 
    description: 'User self-assessment rating (1=very hard, 5=very easy)',
    example: 3,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  selfRating?: number;
}
