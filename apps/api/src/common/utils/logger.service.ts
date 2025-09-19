import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, ...optionalParams: any[]) {
    // You can integrate with Winston, Pino, or any logger here
    console.log('[LOG]', message, ...optionalParams);
  }
  error(message: string, ...optionalParams: any[]) {
    console.error('[ERROR]', message, ...optionalParams);
  }
  warn(message: string, ...optionalParams: any[]) {
    console.warn('[WARN]', message, ...optionalParams);
  }
  debug?(message: string, ...optionalParams: any[]) {
    console.debug('[DEBUG]', message, ...optionalParams);
  }
  verbose?(message: string, ...optionalParams: any[]) {
    console.info('[VERBOSE]', message, ...optionalParams);
  }
}
