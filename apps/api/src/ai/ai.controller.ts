import { RecommendationDto } from './dto/recommendation.dto';
import { ErrorExplanationDto } from './dto/error-explanation.dto';
import { GenerateCardDto } from './dto/generate-card.dto';
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { AIService } from './ai.service';
import { GenerateExampleDto } from './dto/example.dto';
import { GenerateExplanationDto } from './dto/explanation.dto';
import { GenerateSynonymsDto } from './dto/synonyms.dto';
import { formatResponse } from '../common/utils/response.util';
import { AdjustSchedulingDto } from './dto/adjust-scheduling.dto';
import { PronunciationDto } from './dto/pronunciation.dto';
import {
  PronunciationResponseDto,
  ExampleResponseDto,
  ExplanationResponseDto,
  SynonymsResponseDto,
  SchedulingRecommendationDto,
  RecommendationsListDto,
  ErrorExplanationResponseDto,
} from './dto/ai-responses.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AIController {
  constructor(private ai: AIService) {}

  @Post('pronunciation')
  @ApiOperation({
    summary: 'Score pronunciation audio for a word or phrase',
    description:
      'Analyzes audio pronunciation and provides scoring and feedback (currently placeholder implementation)',
  })
  @ApiBody({
    type: PronunciationDto,
    description:
      'Audio data and text for pronunciation analysis including audio file and target word/phrase',
  })
  @ApiResponse({
    status: 200,
    description: 'Pronunciation scored successfully',
    type: PronunciationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async scorePronunciation(@Body() _dto: PronunciationDto) {
    // TODO: Implement pronunciation scoring logic (AI/ML or external API)
    return formatResponse({
      score: null,
      feedback: 'Pronunciation scoring not yet implemented.',
    });
  }

  @Post('example')
  @ApiOperation({
    summary: 'Generate example sentence for context/word',
    description:
      'Uses AI to generate contextual example sentences for vocabulary learning',
  })
  @ApiBody({
    type: GenerateExampleDto,
    description:
      'Context and parameters for example generation including target word, language, and difficulty level',
  })
  @ApiResponse({
    status: 200,
    description: 'Example sentence generated successfully',
    type: ExampleResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateExample(@Body() dto: GenerateExampleDto) {
    const result = await this.ai.generateExample({
      type: 'example',
      context: dto.context,
      language: dto.language,
      difficulty: dto.difficulty,
    });
    return formatResponse(result);
  }

  @Post('explanation')
  @ApiOperation({
    summary: 'Generate explanation for a word within context',
    description:
      'Provides AI-generated explanations for words based on their contextual usage',
  })
  @ApiBody({
    type: GenerateExplanationDto,
    description:
      'Word and context information for generating detailed explanations including usage and meaning',
  })
  @ApiResponse({
    status: 200,
    description: 'Word explanation generated successfully',
    type: ExplanationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateExplanation(@Body() dto: GenerateExplanationDto) {
    const result = await this.ai.generateExplanation(
      dto.word,
      dto.context,
      dto.language
    );
    return formatResponse(result);
  }

  @Post('synonyms')
  @ApiOperation({
    summary: 'Generate synonyms for a word',
    description:
      'Uses AI to generate contextually appropriate synonyms for vocabulary expansion',
  })
  @ApiBody({
    type: GenerateSynonymsDto,
    description:
      'Target word and language for synonym generation including context for appropriate alternatives',
  })
  @ApiResponse({
    status: 200,
    description: 'Synonyms generated successfully',
    type: SynonymsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateSynonyms(@Body() dto: GenerateSynonymsDto) {
    const result = await this.ai.generateSynonyms(dto.word, dto.language);
    return formatResponse(result);
  }

  @Post('scheduling')
  @ApiOperation({
    summary: 'Get AI-based scheduling adjustment recommendation',
    description:
      'Provides AI-powered recommendations for optimizing spaced repetition scheduling based on user performance',
  })
  @ApiBody({
    type: AdjustSchedulingDto,
    description:
      'User performance data including accuracy, streak days, and study patterns for scheduling optimization',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduling recommendation generated successfully',
    type: SchedulingRecommendationDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async adjustScheduling(@Body() dto: AdjustSchedulingDto) {
    const result = await this.ai.adjustScheduling(
      dto.performance,
      dto.streakDays,
      dto.averageAccuracy
    );
    return formatResponse(result);
  }

  @Post('recommendation')
  @ApiOperation({
    summary: 'Get personalized study recommendations',
    description:
      'Generates AI-powered personalized study recommendations based on user learning patterns and preferences',
  })
  @ApiBody({
    type: RecommendationDto,
    description:
      'User preferences and context for personalized study recommendations including learning goals and current progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Recommendations generated successfully',
    type: RecommendationsListDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getRecommendation(@Body() dto: RecommendationDto) {
    const result = await this.ai.getRecommendation(
      dto.userId,
      dto.context,
      dto.limit
    );
    return formatResponse(result);
  }

  @Post('error-explanation')
  @ApiOperation({
    summary: 'Explain an error or mistake to the user',
    description:
      'Provides AI-generated explanations for user errors to help improve learning and understanding',
  })
  @ApiBody({
    type: ErrorExplanationDto,
    description:
      'Error details and context for generating helpful explanations including error type and learning context',
  })
  @ApiResponse({
    status: 200,
    description: 'Error explanation generated successfully',
    type: ErrorExplanationResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async explainError(@Body() dto: ErrorExplanationDto) {
    const result = await this.ai.explainError(dto.error, dto.context);
    return formatResponse(result);
  }

  @Public()
  @Post('generate-card-demo')
  @ApiOperation({
    summary: 'Generate a demo flashcard using fallback data (no auth required)',
    description:
      'Creates a demo flashcard for testing purposes without authentication or AI API calls',
  })
  @ApiBody({
    type: GenerateCardDto,
    description:
      'Card generation parameters including topic, difficulty level, and language',
  })
  @ApiResponse({
    status: 200,
    description: 'Demo card generated successfully',
  })
  async generateCardDemo(@Body() dto: GenerateCardDto) {
    // Use the fallback method directly without AI
    const result = this.getDemoCard(dto.topic, dto.difficulty || 3);
    return formatResponse(result);
  }

  private getDemoCard(topic: string, difficulty: number) {
    const demoCards = {
      vocabulary: {
        front: 'What does "serendipity" mean?',
        back: 'A pleasant surprise; finding something good without looking for it',
        explanation:
          'From a Persian fairy tale about princes making discoveries by accident',
        exampleSentences: [
          'It was pure serendipity that led to their meeting.',
          'The discovery was a result of serendipity.',
        ],
        tags: ['vocabulary', 'english', 'advanced'],
      },
      math: {
        front: 'What is the Pythagorean theorem?',
        back: 'a² + b² = c² (In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides)',
        explanation: 'Named after the ancient Greek mathematician Pythagoras',
        exampleSentences: [
          'Use the Pythagorean theorem to find the missing side.',
          'This right triangle follows the Pythagorean theorem.',
        ],
        tags: ['math', 'geometry', 'theorem'],
      },
      science: {
        front: 'What is photosynthesis?',
        back: 'The process by which plants convert sunlight, water, and carbon dioxide into glucose and oxygen',
        explanation:
          'Essential for plant survival and oxygen production on Earth',
        exampleSentences: [
          'Photosynthesis occurs in the chloroplasts of plant cells.',
          'Without photosynthesis, life on Earth would not exist.',
        ],
        tags: ['science', 'biology', 'plants'],
      },
      general: {
        front: 'What is the capital of Japan?',
        back: 'Tokyo',
        explanation:
          'Tokyo has been the capital of Japan since 1868 and is the largest metropolitan area in the world',
        exampleSentences: [
          'Tokyo is known for its advanced technology.',
          'The Tokyo Olympics were held in 2021.',
        ],
        tags: ['geography', 'capitals', 'japan'],
      },
    };

    const cardKey =
      Object.keys(demoCards).find((key) => topic.toLowerCase().includes(key)) ||
      'general';

    const card = demoCards[cardKey];
    return {
      ...card,
      difficulty,
    };
  }

  @Post('generate-card')
  @ApiOperation({
    summary: 'Generate a flashcard using AI',
    description:
      'Creates a complete flashcard with front/back content, examples, and tags using AI based on topic and difficulty',
  })
  @ApiBody({
    type: GenerateCardDto,
    description:
      'Card generation parameters including topic, difficulty level, and language',
  })
  @ApiResponse({
    status: 200,
    description: 'Card generated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateCard(@Body() dto: GenerateCardDto) {
    const result = await this.ai.generateCard(
      dto.topic,
      dto.difficulty || 3,
      dto.language || 'English'
    );
    return formatResponse(result);
  }
}
