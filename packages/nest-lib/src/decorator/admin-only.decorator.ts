import { SetMetadata } from '@nestjs/common';

import { ADMIN_ONLY_KEY } from '../guard/admin-only.guard.js';

export const AdminOnly = () => SetMetadata(ADMIN_ONLY_KEY, true);
