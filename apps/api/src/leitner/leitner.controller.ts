import {
  Controller,
  Get,
  Query,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { LeitnerService } from './leitner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewCardDto } from './dto/review-card.dto';

@ApiTags('Leitner')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leitner')
export class LeitnerController {
  constructor(private leitnerService: LeitnerService) {}

  @Get('due')
  @ApiOperation({
    summary: 'Get due cards for review',
    description:
      'Retrieves cards that are due for review based on the Leitner spaced repetition algorithm',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of cards to return',
    example: '20',
  })
  @ApiResponse({ status: 200, description: 'Due cards retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDue(@Req() req: any, @Query('limit') limit?: string) {
    return this.leitnerService.getDueCards(
      req.user.id,
      limit ? parseInt(limit, 10) : 50
    );
  }

  @Post(':cardId/review')
  @ApiOperation({
    summary: 'Submit review result for a card',
    description:
      "Records the review result and updates the card's Leitner box and next review date",
  })
  @ApiParam({
    name: 'cardId',
    description: 'ID of the card being reviewed',
    example: 'card-123-uuid-456',
  })
  @ApiBody({
    type: ReviewCardDto,
    description:
      'Review result including correctness and optional self-rating for spaced repetition calculation',
  })
  @ApiResponse({ status: 201, description: 'Review submitted successfully' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 400, description: 'Invalid review data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async review(
    @Req() req: any,
    @Param('cardId') cardId: string,
    @Body() dto: ReviewCardDto
  ) {
    return this.leitnerService.reviewCard(
      cardId,
      req.user.id,
      dto.correct,
      dto.selfRating
    );
  }
}
