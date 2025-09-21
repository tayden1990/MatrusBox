import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PronunciationDto {
  @ApiProperty({
    description: 'The word or phrase to score pronunciation for',
    example: 'pronunciation',
  })
  @IsString()
  word!: string;

  @ApiProperty({
    description: 'Base64 encoded audio data of the pronunciation attempt',
    example: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEA...',
  })
  @IsString()
  audioBase64!: string;

  @ApiProperty({
    description: 'Language of the word being pronounced',
    example: 'English',
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;
}
