import { Module } from '@nestjs/common';

import { ServiceModule } from '../../service/service.module.js';
import { PasswordService } from '../../service/password.service.js';
import { AdminUserController } from './admin-user.controller.js';
import { AdminUserBlockUc } from './uc/admin-user-block.uc.js';
import { AdminUserCreateUc } from './uc/admin-user-create.uc.js';
import { AdminUserDeleteUc } from './uc/admin-user-delete.uc.js';
import { AdminUserDowngradePlanUc } from './uc/admin-user-downgrade-plan.uc.js';
import { AdminUserGetUc } from './uc/admin-user-get.uc.js';
import { AdminUserGetStatsUc } from './uc/admin-user-get-stats.uc.js';
import { AdminUserSearchUc } from './uc/admin-user-search.uc.js';
import { AdminUserSearchPublicUsersUc } from './uc/admin-user-search-public-users.uc.js';
import { AdminUserUnblockUc } from './uc/admin-user-unblock.uc.js';
import { AdminUserUpdateUc } from './uc/admin-user-update.uc.js';
import { AdminUserUpgradePlanUc } from './uc/admin-user-upgrade-plan.uc.js';

@Module({
  imports: [ServiceModule],
  controllers: [AdminUserController],
  providers: [
    PasswordService,
    AdminUserSearchUc,
    AdminUserSearchPublicUsersUc,
    AdminUserGetUc,
    AdminUserGetStatsUc,
    AdminUserCreateUc,
    AdminUserUpdateUc,
    AdminUserDeleteUc,
    AdminUserBlockUc,
    AdminUserUnblockUc,
    AdminUserUpgradePlanUc,
    AdminUserDowngradePlanUc,
  ],
})
export class AdminUserModule {}
