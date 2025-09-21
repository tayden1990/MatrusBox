import { IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionDto {
  @ApiProperty({
    description: 'Type of study session',
    enum: ['review', 'new', 'mixed'],
    example: 'mixed',
    required: false,
  })
  @IsOptional()
  @IsIn(['review', 'new', 'mixed'])
  type?: 'review' | 'new' | 'mixed';

  @ApiProperty({
    description: 'Maximum number of cards in this session',
    example: 20,
    minimum: 1,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number; // max cards in this session
}
