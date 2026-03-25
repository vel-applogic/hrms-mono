import { Module } from '@nestjs/common';

import { ServiceModule } from '../../service/service.module.js';
import { PasswordService } from '../../service/password.service.js';
import { AdminUserController } from './admin-user.controller.js';
import { AdminUserCreateUc } from './uc/admin-user-create.uc.js';
import { AdminUserDeleteUc } from './uc/admin-user-delete.uc.js';
import { AdminUserGetUc } from './uc/admin-user-get.uc.js';
import { AdminUserGetStatsUc } from './uc/admin-user-get-stats.uc.js';
import { AdminUserSearchUc } from './uc/admin-user-search.uc.js';
import { AdminUserUpdateUc } from './uc/admin-user-update.uc.js';

@Module({
  imports: [ServiceModule],
  controllers: [AdminUserController],
  providers: [
    PasswordService,
    AdminUserSearchUc,
    AdminUserGetUc,
    AdminUserGetStatsUc,
    AdminUserCreateUc,
    AdminUserUpdateUc,
    AdminUserDeleteUc,
  ],
})
export class AdminUserModule {}
