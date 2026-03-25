import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { UserDao } from '../db/dao/user.dao.js';
import type { RequestWithUser } from '../type/request.type.js';
import { userRoleDbEnumToDtoEnum } from '../util/enum.util.js';

@Injectable()
export class CommonAuthenticateMiddleware implements NestMiddleware {
  constructor(private readonly userDao: UserDao) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const userId = req.headers['x-user-id'] as string;
    const organizationId = (req.headers['x-organization-id'] as string) || '0';

    if (userId) {
      const user = await this.userDao.getById({ id: Number(userId) });
      if (user) {
        (req as RequestWithUser).user = {
          id: user.id,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          isActive: user.isActive,
          organizationId: Number(organizationId),
          roles: [],
        };
      }
    }

    next();
  }
}
