import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { StudyService } from './study.service';
import { StartSessionDto } from './dto/start-session.dto';
import { AnswerDto } from './dto/answer.dto';

@ApiTags('Study')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('study')
export class StudyController {
  constructor(private studyService: StudyService) {}

  @Post('session')
  @ApiOperation({
    summary: 'Start a new study session',
    description:
      'Initiates a new spaced repetition study session with selected cards',
  })
  @ApiBody({
    type: StartSessionDto,
    description:
      'Study session configuration including card selection criteria, session type, and optional time limits',
  })
  @ApiResponse({
    status: 201,
    description: 'Study session started successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid session parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  start(@Req() req: any, @Body() dto: StartSessionDto) {
    return this.studyService.startSession(req.user.id, dto);
  }

  @Get('session/:id')
  @ApiOperation({
    summary: 'Get session details (with answers)',
    description:
      'Retrieves comprehensive details of a study session including progress and submitted answers',
  })
  @ApiParam({
    name: 'id',
    description: 'Study session ID',
    example: 'session-123-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Session details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSession(@Req() req: any, @Param('id') _id: string) {
    return this.studyService.getSession(req.user.id, _id);
  }

  @Post('session/:id/end')
  @ApiOperation({
    summary: 'End a session',
    description:
      'Completes a study session and calculates final statistics and performance metrics',
  })
  @ApiParam({
    name: 'id',
    description: 'Study session ID to end',
    example: 'session-123-uuid-456',
  })
  @ApiResponse({ status: 200, description: 'Session ended successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Session already ended' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  end(@Req() req: any, @Param('id') _id: string) {
    return this.studyService.endSession(req.user.id, _id);
  }

  @Get('session/:id/next')
  @ApiOperation({
    summary: 'Get next card for this session',
    description:
      'Retrieves the next card to be studied using spaced repetition algorithm',
  })
  @ApiParam({
    name: 'id',
    description: 'Study session ID',
    example: 'session-123-uuid-456',
  })
  @ApiResponse({ status: 200, description: 'Next card retrieved successfully' })
  @ApiResponse({
    status: 404,
    description: 'Session not found or no more cards',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  next(@Req() req: any, @Param('id') _id: string) {
    return this.studyService.getNextCard(req.user.id, _id);
  }

  @Post('session/:id/answer')
  @ApiOperation({
    summary: 'Submit an answer for a card in the session',
    description:
      'Records user response and updates spaced repetition scheduling based on answer quality',
  })
  @ApiParam({
    name: 'id',
    description: 'Study session ID',
    example: 'session-123-uuid-456',
  })
  @ApiBody({
    type: AnswerDto,
    description:
      'User answer details including card ID, response content, correctness, and optional performance metrics',
  })
  @ApiResponse({ status: 201, description: 'Answer submitted successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  @ApiResponse({ status: 400, description: 'Invalid answer data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  answer(@Req() req: any, @Param('id') _id: string, @Body() dto: AnswerDto) {
    return this.studyService.answer(req.user.id, _id, dto);
  }

  // Demo endpoints for testing without authentication
  @Public()
  @Post('session/demo')
  @ApiOperation({
    summary: 'Start a demo study session (no auth required)',
    description: 'Starts a demo study session for testing purposes',
  })
  startDemo(@Body() dto: StartSessionDto) {
    // Mock session data
    const mockSession = {
      id: `demo-session-${Date.now()}`,
      userId: 'demo-user',
      sessionType: dto.type || 'mixed',
      maxCards: dto.limit || 10,
      startedAt: new Date(),
      cardsRemaining: 8,
      totalCards: 10,
      status: 'active',
    };

    return {
      success: true,
      data: mockSession,
    };
  }

  @Public()
  @Get('session/:id/next/demo')
  @ApiOperation({
    summary: 'Get next demo card (no auth required)',
    description: 'Gets the next card in a demo study session',
  })
  nextDemo(@Param('id') _id: string) {
    // Mock card data
    const mockCards = [
      {
        id: `card-${Date.now()}`,
        front: 'What is the capital of France?',
        back: 'Paris',
        explanation: 'Paris is the capital and most populous city of France.',
        exampleSentences: [
          'Paris is known for the Eiffel Tower.',
          'The Louvre Museum is located in Paris.',
        ],
        tags: ['geography', 'capitals'],
        leitnerCard: {
          id: 'leitner-1',
          boxLevel: 2,
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000),
          repetitions: 1,
          easiness: 2.5,
          interval: 1,
        },
      },
      {
        id: `card-${Date.now() + 1}`,
        front: 'What is 2 + 2?',
        back: '4',
        explanation: 'Basic addition: two plus two equals four.',
        exampleSentences: ['2 + 2 = 4 is a fundamental arithmetic fact.'],
        tags: ['math', 'arithmetic'],
        leitnerCard: {
          id: 'leitner-2',
          boxLevel: 1,
          lastReviewed: new Date(),
          nextReview: new Date(Date.now() + 12 * 60 * 60 * 1000),
          repetitions: 0,
          easiness: 2.5,
          interval: 1,
        },
      },
    ];

    const randomCard = mockCards[Math.floor(Math.random() * mockCards.length)];

    return {
      success: true,
      data: randomCard,
    };
  }

  @Public()
  @Post('session/:id/answer/demo')
  @ApiOperation({
    summary: 'Submit demo answer (no auth required)',
    description: 'Submits an answer in a demo study session',
  })
  answerDemo(@Param('id') _id: string, @Body() _dto: AnswerDto) {
    // Mock response
    return {
      success: true,
      data: {
        correct: Math.random() > 0.3, // 70% correct rate
        newBoxLevel: Math.floor(Math.random() * 5) + 1,
        nextReview: new Date(
          Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        pointsEarned: Math.floor(Math.random() * 10) + 5,
      },
    };
  }
}
