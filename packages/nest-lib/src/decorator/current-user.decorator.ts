import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithUser } from '../type/request.type.js';
import { CurrentUserType } from '../type/user.type.js';

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext): CurrentUserType | undefined => {
  const request = context.switchToHttp().getRequest<RequestWithUser>();
  if (request.user == null) {
    // throw new Error('User not found in request1');
    return undefined;
  }
  // Extract only the fields needed for CurrentUserType
  return {
    id: request.user.id,
    email: request.user.email!,
    firstname: request.user.firstname!,
    lastname: request.user.lastname!,
    isActive: request.user.isActive!,
    roles: request.user.roles,
    organizationId: request.user.organizationId,
  };
});
