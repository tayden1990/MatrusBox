import { Injectable, NotFoundException } from '@nestjs/common';
import { LeitnerService } from '../leitner/leitner.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService, private leitnerService: LeitnerService) {}

  async create(userId: string, dto: CreateCardDto) {
    const card = await this.prisma.card.create({
      data: {
        userId,
        front: dto.front,
        back: dto.back,
        explanation: dto.explanation,
        exampleSentences: dto.exampleSentences || [],
        tags: dto.tags || [],
        media: dto.media || null,
        difficulty: dto.difficulty ?? 1,
      },
    });
    // Ensure a LeitnerCard entry exists
    await this.leitnerService.ensureLeitnerCard(card.id, userId);
    return { success: true, data: card };
  }

  async findAll(userId: string, query: { tag?: string; search?: string; skip?: number; take?: number }) {
    const { tag, search, skip = 0, take = 50 } = query;
    const where: any = { userId };
    if (tag) {
      where.tags = { has: tag };
    }
    if (search) {
      where.OR = [
        { front: { contains: search, mode: 'insensitive' } },
        { back: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Math.min(take, 100),
      }),
      this.prisma.card.count({ where }),
    ]);

    return { success: true, data: { items, total, skip, take } };
  }

  async findOne(userId: string, id: string) {
    const card = await this.prisma.card.findFirst({
      where: { id, userId },
    });
    if (!card) throw new NotFoundException('Card not found');
    return { success: true, data: card };
  }

  async update(userId: string, id: string, dto: UpdateCardDto) {
    const existing = await this.prisma.card.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Card not found');

    const card = await this.prisma.card.update({
      where: { id },
      data: {
        front: dto.front ?? existing.front,
        back: dto.back ?? existing.back,
        explanation: dto.explanation ?? existing.explanation,
        exampleSentences: dto.exampleSentences ?? existing.exampleSentences,
        tags: dto.tags ?? existing.tags,
        media: dto.media ?? existing.media,
        difficulty: dto.difficulty ?? existing.difficulty,
      },
    });
    return { success: true, data: card };
  }

  async remove(userId: string, id: string) {
    const existing = await this.prisma.card.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Card not found');
    await this.prisma.card.delete({ where: { id } });
    return { success: true, data: { id } };
  }
}
