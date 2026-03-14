import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';

import { queryContextStorage } from '../db/prisma/query-context.js';
import type { RequestWithUser } from '../type/request.type.js';

@Injectable()
export class QueryContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const requestId = request.headers['x-request-id'] as string;
    const userId = request.user?.id;

    return new Observable((subscriber) => {
      queryContextStorage.run({ requestId, userId }, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
