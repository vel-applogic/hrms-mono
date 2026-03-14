import type { Request } from 'express';

import type { CurrentUserType } from './user.type.js';

export interface RequestWithUser extends Request {
  user?: CurrentUserType;
}
