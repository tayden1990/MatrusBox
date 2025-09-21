import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateSynonymsDto {
  @ApiProperty({
    description: 'The word to generate synonyms for',
    example: 'happy',
  })
  @IsString()
  word!: string;

  @ApiProperty({
    description: 'Target language for synonyms',
    example: 'English',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;
}
