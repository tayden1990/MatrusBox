import { AdminModule } from './admin/admin.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CardsModule } from './cards/cards.module';
import { LeitnerModule } from './leitner/leitner.module';
import { StudyModule } from './study/study.module';
import { AIModule } from './ai/ai.module';
import { TelegramModule } from './telegram/telegram.module';
import { WebsocketModule } from './websocket/websocket.module';

import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationService } from './common/utils/notification.service';
import { NotificationController } from './common/notification.controller';
import { LoggerService } from './common/utils/logger.service';
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    PrismaModule,

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // JWT
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),

    // Redis/Bull for background jobs
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    CardsModule,
    LeitnerModule,
    StudyModule,
    AIModule,
    TelegramModule,
    AnalyticsModule,
  AdminModule,
    WebsocketModule,
  ],
  providers: [NotificationService, LoggerService],
  exports: [NotificationService, LoggerService],
  controllers: [NotificationController],
})
export class AppModule {}