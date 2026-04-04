import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleDtoEnum } from '@repo/dto';
import { ApiError } from '@repo/shared';

import type { RequestWithUser } from '../type/request.type.js';

export const ADMIN_ONLY_KEY = 'adminOnly';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminOnly = this.reflector.getAllAndOverride<boolean>(ADMIN_ONLY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isAdminOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ApiError('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!user.isSuperAdmin && !user.roles.includes(UserRoleDtoEnum.admin)) {
      throw new ApiError('Forbidden: admin role required', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
