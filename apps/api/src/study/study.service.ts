import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LeitnerService } from '../leitner/leitner.service';
import { StartSessionDto } from './dto/start-session.dto';
import { AnswerDto } from './dto/answer.dto';

@Injectable()
export class StudyService {
  constructor(
    private prisma: PrismaService,
    private leitner: LeitnerService
  ) {}

  async startSession(userId: string, dto: StartSessionDto) {
    const session = await this.prisma.studySession.create({
      data: {
        userId,
        sessionType: dto.type || 'review',
      },
    });
    return { success: true, data: session };
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId },
      include: {
        answers: true,
      },
    });
    if (!session) throw new NotFoundException('Session not found');
    return { success: true, data: session };
  }

  async endSession(userId: string, sessionId: string) {
    const existing = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!existing) throw new NotFoundException('Session not found');
    if (existing.endedAt) return { success: true, data: existing }; // already ended
    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });
    return { success: true, data: updated };
  }

  async getNextCard(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.endedAt) throw new BadRequestException('Session already ended');

    const answered = await this.prisma.studyAnswer.findMany({
      where: { sessionId },
      select: { cardId: true },
    });
    const answeredIds = answered.map((a) => a.cardId);

    // 1. Try due Leitner cards not yet answered
    const now = new Date();
    const due = await this.prisma.leitnerCard.findFirst({
      where: {
        userId,
        nextReviewAt: { lte: now },
        cardId: { notIn: answeredIds.length ? answeredIds : [''] },
      },
      orderBy: { nextReviewAt: 'asc' },
      include: { card: true },
    });
    if (due) return { success: true, data: { card: due.card, source: 'due' } };

    // 2. If mixed or new: find a new (never reviewed) card
    if (session.sessionType === 'mixed' || session.sessionType === 'new') {
      const fresh = await this.prisma.leitnerCard.findFirst({
        where: {
          userId,
          repetitions: 0,
          cardId: { notIn: answeredIds.length ? answeredIds : [''] },
        },
        orderBy: { createdAt: 'asc' },
        include: { card: true },
      });
      if (fresh)
        return { success: true, data: { card: fresh.card, source: 'new' } };
    }

    return { success: true, data: { card: null, done: true } };
  }

  async answer(userId: string, sessionId: string, dto: AnswerDto) {
    const session = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.endedAt) throw new BadRequestException('Session already ended');

    const card = await this.prisma.card.findFirst({
      where: { id: dto.cardId, userId },
    });
    if (!card) throw new NotFoundException('Card not found');

    // Ensure Leitner card exists (safety)
    await this.leitner.ensureLeitnerCard(card.id, userId);

    // Update scheduling
    await this.leitner.reviewCard(card.id, userId, dto.correct, dto.selfRating);

    const timeSpent = dto.timeSpent ?? 0;

    // Record answer & update session stats in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const answer = await tx.studyAnswer.create({
        data: {
          sessionId,
          cardId: card.id,
          userAnswer: dto.userAnswer,
          isCorrect: dto.correct,
          timeSpent,
          difficulty: dto.selfRating,
        },
      });

      const updatedSession = await tx.studySession.update({
        where: { id: sessionId },
        data: {
          cardsAttempted: { increment: 1 },
          cardsCorrect: dto.correct ? { increment: 1 } : undefined,
          totalTimeSpent: { increment: timeSpent },
        },
      });

      return { answer, session: updatedSession };
    });

    return { success: true, data: result };
  }
}
