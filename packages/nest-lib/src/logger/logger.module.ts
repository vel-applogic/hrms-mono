import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';

import { CommonLoggerService } from './logger.service.js';

@Module({})
export class CommonLoggerModule {
  static forRoot() {
    return {
      module: CommonLoggerModule,
      imports: [
        LoggerModule.forRoot({
          pinoHttp: {
            transport: process.env.APP_ENV === 'local' ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } } : undefined,
            autoLogging: false,
          },
        }),
      ],
      providers: [CommonLoggerService],
      exports: [CommonLoggerService],
    };
  }
}
