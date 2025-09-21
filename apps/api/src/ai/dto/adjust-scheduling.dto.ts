import { IsNumber, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustSchedulingDto {
  @ApiProperty({
    description: 'User performance score (0-100)',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  performance!: number;

  @ApiProperty({
    description: 'Number of consecutive study days',
    example: 7,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  streakDays!: number;

  @ApiProperty({
    description: 'Average accuracy rate (0.0 to 1.0)',
    example: 0.75,
    minimum: 0,
    maximum: 1,
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  averageAccuracy!: number;
}
