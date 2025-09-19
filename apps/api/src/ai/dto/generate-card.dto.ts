import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateCardDto {
  @ApiProperty({ 
    description: 'Topic or subject for the card',
    example: 'vocabulary'
  })
  @IsString()
  topic!: string;

  @ApiProperty({ 
    description: 'Difficulty level from 1 (easy) to 5 (very hard)',
    example: 3,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @ApiProperty({ 
    description: 'Language for the card content',
    example: 'English',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ 
    description: 'Number of cards to generate',
    example: 1,
    minimum: 1,
    maximum: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  count?: number;
}