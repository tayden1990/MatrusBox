import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewCardDto {
  @ApiProperty({ 
    description: 'Whether the answer was correct',
    example: true
  })
  @IsBoolean()
  correct!: boolean;

  @ApiProperty({ 
    description: 'User self-assessment difficulty rating (1=very hard, 5=very easy)',
    example: 3,
    minimum: 1,
    maximum: 5,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  selfRating?: number; // optional user difficulty rating 1-5
}
