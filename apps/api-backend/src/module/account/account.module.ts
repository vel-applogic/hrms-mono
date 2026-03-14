import { Module } from '@nestjs/common';

import { PasswordService } from '../../service/password.service.js';
import { AccountController } from './account.controller.js';
import { AccountChangePasswordUc } from './uc/account-change-password.uc.js';
import { AccountGetProfileUc } from './uc/account-get-profile.uc.js';
import { AccountUpdateProfileUc } from './uc/account-update-profile.uc.js';

@Module({
  controllers: [AccountController],
  providers: [PasswordService, AccountGetProfileUc, AccountUpdateProfileUc, AccountChangePasswordUc],
})
export class AccountModule {}
