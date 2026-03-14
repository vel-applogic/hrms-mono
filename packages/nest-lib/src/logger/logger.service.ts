import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class CommonLoggerService {
  constructor(private readonly pino: PinoLogger) {}

  i(message: string, data?: Record<string, unknown>) {
    this.pino.info(data ?? {}, message);
  }

  w(message: string, data?: Record<string, unknown>) {
    this.pino.warn(data ?? {}, message);
  }

  a(message: string, data?: Record<string, unknown>) {
    this.pino.warn(data ?? {}, `[ALERT] ${message}`);
  }

  e(message: string, data?: Record<string, unknown>) {
    this.pino.error(data ?? {}, message);
  }
}
