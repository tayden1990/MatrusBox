import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecommendationDto {
  @ApiProperty({ 
    description: 'User ID to generate recommendations for',
    example: 'user-123-uuid-456'
  })
  @IsString()
  userId: string;

  @ApiProperty({ 
    description: 'Context for personalized recommendations',
    example: 'vocabulary building for business English',
    required: false
  })
  @IsOptional()
  @IsString()
  context?: string;

  @ApiProperty({ 
    description: 'Maximum number of recommendations to return',
    example: 10,
    required: false
  })
  @IsOptional()
  @IsNumber()
  limit?: number;
}
