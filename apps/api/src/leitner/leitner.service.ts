import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SchedulingResult {
  boxLevel: number;
  easeFactor: number;
  interval: number; // days
  nextReviewAt: Date;
  repetitions: number;
  totalReviews: number;
  correctReviews: number;
  consecutiveCorrect: number;
}

@Injectable()
export class LeitnerService {
  private readonly maxBox = 5;

  constructor(private prisma: PrismaService) {}

  async ensureLeitnerCard(cardId: string, userId: string) {
    let lc = await this.prisma.leitnerCard.findUnique({ where: { cardId } });
    if (!lc) {
      lc = await this.prisma.leitnerCard.create({
        data: {
          cardId,
          userId,
          boxLevel: 1,
          easeFactor: 2.5,
          interval: 1,
          repetitions: 0,
          nextReviewAt: new Date(),
        },
      });
    }
    return lc;
  }

  async getDueCards(userId: string, limit = 50) {
    const now = new Date();
    const cards = await this.prisma.leitnerCard.findMany({
      where: { userId, nextReviewAt: { lte: now } },
      orderBy: [{ nextReviewAt: 'asc' }],
      take: limit,
      include: { card: true },
    });
    return { success: true, data: cards };
  }

  private computeAdaptiveInterval(lc: any, correct: boolean, selfRating?: number): SchedulingResult {
    let { boxLevel, easeFactor, interval, repetitions, totalReviews, correctReviews, consecutiveCorrect } = lc;
    totalReviews += 1;

    if (correct) {
      correctReviews += 1;
      consecutiveCorrect += 1;
      repetitions += 1;
      boxLevel = Math.min(this.maxBox, boxLevel + 1);
      // Adjust ease factor using SM-2 style formula with selfRating fallback
      const quality = selfRating != null ? selfRating : 4; // assume good if correct
      easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easeFactor < 1.3) easeFactor = 1.3;
      if (repetitions === 1) interval = 1;
      else if (repetitions === 2) interval = 3;
      else {
        interval = Math.round(interval * easeFactor);
      }
    } else {
      consecutiveCorrect = 0;
      repetitions = 0; // reset repetition count when wrong
      boxLevel = Math.max(1, boxLevel - 1);
      interval = 1; // immediate short retry
      // Slightly reduce ease factor
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    }

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + interval);

    return { boxLevel, easeFactor, interval, nextReviewAt, repetitions, totalReviews, correctReviews, consecutiveCorrect };
  }

  async reviewCard(cardId: string, userId: string, correct: boolean, selfRating?: number) {
    const lc = await this.prisma.leitnerCard.findUnique({ where: { cardId } });
    if (!lc || lc.userId !== userId) throw new NotFoundException('Leitner card not found');

    const result = this.computeAdaptiveInterval(lc, correct, selfRating);

    const updated = await this.prisma.leitnerCard.update({
      where: { cardId },
      data: {
        ...result,
        lastReviewedAt: new Date(),
      },
    });
    return { success: true, data: updated };
  }
}
