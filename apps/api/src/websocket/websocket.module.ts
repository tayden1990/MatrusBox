import { Module } from '@nestjs/common';
import { StudyGateway } from './study.gateway';

@Module({
	providers: [StudyGateway],
})
export class WebsocketModule {}