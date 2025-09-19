import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LeitnerModule } from '../leitner/leitner.module';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';

@Module({
	imports: [PrismaModule, LeitnerModule],
	providers: [StudyService],
	controllers: [StudyController],
	exports: [StudyService],
})
export class StudyModule {}
