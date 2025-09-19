import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateExampleDto {
  @ApiProperty({ 
    description: 'Context or word for which to generate an example sentence',
    example: 'The word "serendipity" in a literary context'
  })
  @IsString()
  context!: string;

  @ApiProperty({ 
    description: 'Target language for the example',
    example: 'English',
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ 
    description: 'Difficulty level from 1 (easy) to 5 (advanced)',
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
}
