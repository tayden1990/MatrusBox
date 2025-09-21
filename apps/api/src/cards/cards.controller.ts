import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
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
import { getPagination, buildMeta } from '../common/dto/pagination-query.dto';
import { formatResponse } from '../common/utils/response.util';
import { CardsService } from './cards.service';
import {
  CreateCardDto,
  CardResponseDto,
  CardsListResponseDto,
} from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { SuccessResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private cardsService: CardsService) {}

  @Public()
  @Post('demo')
  @ApiOperation({
    summary: 'Create a demo card (no auth required)',
    description:
      'Creates a demo flashcard for testing purposes without authentication',
  })
  @ApiBody({
    type: CreateCardDto,
    description: 'Card creation details for demo purposes',
  })
  @ApiResponse({
    status: 201,
    description: 'Demo card created successfully',
    type: CardResponseDto,
  })
  createDemo(@Body() dto: CreateCardDto) {
    // Return a mock response for demo purposes
    const mockCard = {
      id: `demo-card-${Date.now()}`,
      front: dto.front,
      back: dto.back,
      explanation: dto.explanation,
      exampleSentences: dto.exampleSentences || [],
      tags: dto.tags || [],
      difficulty: dto.difficulty || 3,
      userId: 'demo-user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return formatResponse(mockCard);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new card',
    description:
      'Creates a new flashcard with front/back content, optional explanation, examples, and tags',
  })
  @ApiBody({
    type: CreateCardDto,
    description:
      'Card creation details including front content, back content, explanation, examples, tags, and difficulty level',
  })
  @ApiResponse({
    status: 201,
    description: 'Card created successfully',
    type: CardResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid card data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Req() req: any, @Body() dto: CreateCardDto) {
    return this.cardsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List cards (filterable, paginated)',
    description:
      'Retrieves a paginated list of user cards with optional filtering by tag and search term',
  })
  @ApiQuery({
    name: 'tag',
    required: false,
    description: 'Filter cards by tag',
    example: 'vocabulary',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search cards by content',
    example: 'serendipity',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: '1',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of cards per page',
    example: '20',
  })
  @ApiResponse({
    status: 200,
    description: 'Cards retrieved successfully',
    type: CardsListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @Req() req: any,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    const pg = getPagination(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 50
    );
    const result = await this.cardsService.findAll(req.user.id, {
      tag,
      search,
      skip: pg.skip,
      take: pg.take,
    });
    const { items, total } = result.data;
    return formatResponse(items, buildMeta(total, pg.page, pg.pageSize));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single card',
    description: 'Retrieves detailed information for a specific card by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the card',
    example: 'card-123-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Card retrieved successfully',
    type: CardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.cardsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a card',
    description:
      'Updates an existing card with new content, tags, or difficulty level',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the card to update',
    example: 'card-123-uuid-456',
  })
  @ApiBody({
    type: UpdateCardDto,
    description:
      'Card update details including optional front content, back content, explanation, examples, tags, and difficulty level',
  })
  @ApiResponse({
    status: 200,
    description: 'Card updated successfully',
    type: CardResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 400, description: 'Invalid update data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateCardDto) {
    return this.cardsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a card',
    description: "Permanently removes a card from the user's collection",
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the card to delete',
    example: 'card-123-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Card deleted successfully',
    type: SuccessResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.cardsService.remove(req.user.id, id);
  }
}
