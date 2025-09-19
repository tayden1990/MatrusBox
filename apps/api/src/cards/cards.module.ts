import { Module } from '@nestjs/common';
import { CardsService } from "./cards.service";
import { CardsController } from "./cards.controller";
import { PrismaModule } from '../prisma/prisma.module';
import { LeitnerModule } from '../leitner/leitner.module';

@Module({
	imports: [PrismaModule, LeitnerModule],
	controllers: [CardsController],
	providers: [CardsService],
	exports: [CardsService],
})
export class CardsModule {}