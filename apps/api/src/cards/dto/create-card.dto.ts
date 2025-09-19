import { IsString, IsOptional, IsInt, Min, Max, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({ 
    description: 'Front side content of the flashcard',
    example: 'What is the meaning of "serendipity"?'
  })
  @IsString()
  front!: string;

  @ApiProperty({ 
    description: 'Back side content of the flashcard (answer)',
    example: 'A pleasant surprise; finding something good without looking for it'
  })
  @IsString()
  back!: string;

  @ApiProperty({ 
    description: 'Additional explanation for the card content',
    example: 'Serendipity comes from a Persian fairy tale about princes who made discoveries by accident',
    required: false
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiProperty({ 
    description: 'Example sentences demonstrating usage',
    example: ['It was pure serendipity that led to their meeting.', 'The discovery was a result of serendipity.'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  exampleSentences?: string[];

  @ApiProperty({ 
    description: 'Tags for categorizing the card',
    example: ['vocabulary', 'english', 'advanced'],
    required: false,
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Media attachments (images, audio, etc.)',
    required: false
  })
  @IsOptional()
  media?: any; // Could refine with a type/interface

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
}

export class CardResponseDto {
  @ApiProperty({ 
    description: 'Unique card identifier',
    example: 'card-123-uuid-456'
  })
  id: string;

  @ApiProperty({ 
    description: 'Front side content of the flashcard',
    example: 'What is the meaning of "serendipity"?'
  })
  front: string;

  @ApiProperty({ 
    description: 'Back side content of the flashcard (answer)',
    example: 'A pleasant surprise; finding something good without looking for it'
  })
  back: string;

  @ApiProperty({ 
    description: 'Additional explanation for the card content',
    example: 'Serendipity comes from a Persian fairy tale about princes who made discoveries by accident',
    required: false
  })
  explanation?: string;

  @ApiProperty({ 
    description: 'Example sentences demonstrating usage',
    example: ['It was pure serendipity that led to their meeting.', 'The discovery was a result of serendipity.'],
    type: [String],
    required: false
  })
  examples?: string[];

  @ApiProperty({ 
    description: 'Tags for categorizing the card',
    example: ['vocabulary', 'english', 'advanced'],
    type: [String],
    required: false
  })
  tags?: string[];

  @ApiProperty({ 
    description: 'Difficulty level from 1 (easiest) to 5 (hardest)',
    example: 3,
    minimum: 1,
    maximum: 5,
    required: false
  })
  difficulty?: number;

  @ApiProperty({ 
    description: 'Current Leitner box level (1-5)',
    example: 2,
    minimum: 1,
    maximum: 5
  })
  leitnerBox: number;

  @ApiProperty({ 
    description: 'Next review date for spaced repetition',
    example: '2024-01-15T10:30:00Z'
  })
  nextReview: Date;

  @ApiProperty({ 
    description: 'Card creation timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({ 
    description: 'Last card update timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  updatedAt: Date;
}

export class CardsListResponseDto {
  @ApiProperty({ 
    description: 'Array of cards',
    type: [CardResponseDto]
  })
  data: CardResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    type: 'object',
    properties: {
      total: { type: 'number', example: 150 },
      page: { type: 'number', example: 1 },
      pageSize: { type: 'number', example: 20 },
      totalPages: { type: 'number', example: 8 }
    }
  })
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
