import { ApiProperty } from '@nestjs/swagger';

export class PronunciationResponseDto {
  @ApiProperty({
    description: 'Pronunciation accuracy score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  score?: number;

  @ApiProperty({
    description: 'Detailed feedback on pronunciation',
    example:
      'Good pronunciation overall. Pay attention to the "th" sound in "serendipity".',
  })
  feedback: string;
}

export class ExampleResponseDto {
  @ApiProperty({
    description: 'Generated example sentence',
    example:
      'It was pure serendipity that led to their meeting at the coffee shop.',
  })
  example: string;

  @ApiProperty({
    description: 'Context or difficulty level used',
    example: 'intermediate',
  })
  context: string;
}

export class ExplanationResponseDto {
  @ApiProperty({
    description: 'Detailed explanation of the word or concept',
    example:
      'Serendipity refers to the occurrence of events by chance in a happy or beneficial way. It comes from a Persian fairy tale about three princes who made discoveries by accident.',
  })
  explanation: string;

  @ApiProperty({
    description: 'Etymology or word origin information',
    example:
      'From the Persian fairy tale "The Three Princes of Serendip" by Horace Walpole (1754)',
  })
  etymology?: string;
}

export class SynonymsResponseDto {
  @ApiProperty({
    description: 'List of synonyms for the word',
    example: ['coincidence', 'luck', 'fortune', 'chance', 'accident'],
    type: [String],
  })
  synonyms: string[];

  @ApiProperty({
    description: 'The original word',
    example: 'serendipity',
  })
  word: string;
}

export class SchedulingRecommendationDto {
  @ApiProperty({
    description: 'Recommended adjustment to review intervals',
    example: 'Increase interval by 20% due to high accuracy',
  })
  recommendation: string;

  @ApiProperty({
    description: 'Suggested next review time in hours',
    example: 48,
  })
  nextReviewHours: number;

  @ApiProperty({
    description: 'Confidence level of the recommendation (0-100)',
    example: 92,
    minimum: 0,
    maximum: 100,
  })
  confidence: number;
}

export class StudyRecommendationDto {
  @ApiProperty({
    description: 'Type of recommendation',
    example: 'Focus on vocabulary cards with low accuracy',
    enum: [
      'focus_weak_areas',
      'review_due_cards',
      'practice_new_material',
      'take_break',
    ],
  })
  type: string;

  @ApiProperty({
    description: 'Detailed recommendation message',
    example:
      'Based on your recent performance, focus on vocabulary cards where your accuracy is below 70%. Consider reviewing the explanation and examples for these cards.',
  })
  message: string;

  @ApiProperty({
    description: 'Suggested study time in minutes',
    example: 25,
  })
  suggestedTime: number;

  @ApiProperty({
    description: 'Priority level of this recommendation',
    example: 'high',
    enum: ['low', 'medium', 'high'],
  })
  priority: string;
}

export class RecommendationsListDto {
  @ApiProperty({
    description: 'List of personalized study recommendations',
    type: [StudyRecommendationDto],
  })
  recommendations: StudyRecommendationDto[];

  @ApiProperty({
    description: 'Overall study health score (0-100)',
    example: 78,
    minimum: 0,
    maximum: 100,
  })
  studyHealthScore: number;
}

export class ErrorExplanationResponseDto {
  @ApiProperty({
    description: 'Detailed explanation of why the error occurred',
    example:
      'You confused "their" with "there". "Their" is a possessive pronoun showing ownership, while "there" indicates a place or location.',
  })
  explanation: string;

  @ApiProperty({
    description: 'Correct form or answer',
    example: 'their',
  })
  correction: string;

  @ApiProperty({
    description: 'Tips to avoid similar errors',
    example:
      'Remember: "their" shows possession (their car), "there" shows location (over there), "they\'re" is a contraction (they are).',
  })
  tips: string;

  @ApiProperty({
    description: 'Additional examples demonstrating correct usage',
    example: [
      'They parked their car over there.',
      'Their house is there, on the corner.',
    ],
    type: [String],
  })
  examples: string[];
}
