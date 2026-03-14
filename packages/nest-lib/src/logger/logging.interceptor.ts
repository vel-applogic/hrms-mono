import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { CommonLoggerService } from './logger.service.js';

@Injectable()
export class CommonLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CommonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    this.logger.i(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;
        this.logger.i(`← ${method} ${url} ${response.statusCode} ${duration}ms`);
      }),
    );
  }
}
