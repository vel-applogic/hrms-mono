import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { ApiError } from '@repo/shared';
import type { NextFunction, Request, Response } from 'express';

import type { RequestWithUser } from '../type/request.type.js';

@Injectable()
export class CommonAdminUserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const user = (req as RequestWithUser).user;

    if (!user) {
      throw new ApiError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (user.role !== 'admin') {
      throw new ApiError('Forbidden: admin role required', HttpStatus.FORBIDDEN);
    }

    next();
  }
}
