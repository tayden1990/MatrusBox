import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorExplanationDto {
  @ApiProperty({ 
    description: 'The error or mistake made by the user',
    example: 'I said "I have ate" instead of "I have eaten"'
  })
  @IsString()
  error: string;

  @ApiProperty({ 
    description: 'Additional context about the error',
    example: 'This was in a past tense exercise about irregular verbs',
    required: false
  })
  @IsOptional()
  @IsString()
  context?: string;
}
