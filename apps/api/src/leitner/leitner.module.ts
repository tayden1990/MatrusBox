import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeitnerService } from './leitner.service';
import { LeitnerController } from './leitner.controller';

@Module({
	imports: [PrismaModule],
	providers: [LeitnerService],
	controllers: [LeitnerController],
	exports: [LeitnerService],
})
export class LeitnerModule {}
