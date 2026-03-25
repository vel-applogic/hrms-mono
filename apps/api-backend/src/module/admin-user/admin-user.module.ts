import { Module } from '@nestjs/common';

import { ServiceModule } from '../../service/service.module.js';
import { PasswordService } from '../../service/password.service.js';
import { AdminUserController } from './admin-user.controller.js';
import { AdminUserCreateUc } from './uc/admin-user-create.uc.js';
import { AdminUserGetUc } from './uc/admin-user-get.uc.js';
import { AdminUserGetStatsUc } from './uc/admin-user-get-stats.uc.js';
import { AdminUserSearchPublicUsersUc } from './uc/admin-user-search-public-users.uc.js';
import { AdminUserUpdateUc } from './uc/admin-user-update.uc.js';

@Module({
  imports: [ServiceModule],
  controllers: [AdminUserController],
  providers: [
    PasswordService,
    AdminUserSearchPublicUsersUc,
    AdminUserGetUc,
    AdminUserGetStatsUc,
    AdminUserCreateUc,
    AdminUserUpdateUc,
  ],
})
export class AdminUserModule {}
