import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateExplanationDto {
  @ApiProperty({
    description: 'The word to generate an explanation for',
    example: 'serendipity',
  })
  @IsString()
  word!: string;

  @ApiProperty({
    description: 'Context in which the word appears',
    example: 'It was pure serendipity that led to their meeting.',
  })
  @IsString()
  context!: string;

  @ApiProperty({
    description: 'Target language for the explanation',
    example: 'English',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;
}
