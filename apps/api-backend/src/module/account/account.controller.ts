import { Body, Controller, Get, Put } from '@nestjs/common';
import type {
  AccountChangePasswordRequestType,
  AccountUpdateProfileRequestType,
  AccountUpdateProfileResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AccountChangePasswordRequestSchema, AccountUpdateProfileRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { AccountChangePasswordUc } from './uc/account-change-password.uc.js';
import { AccountGetProfileUc } from './uc/account-get-profile.uc.js';
import { AccountUpdateProfileUc } from './uc/account-update-profile.uc.js';

@Controller('api/admin/account')
export class AccountController {
  constructor(
    private readonly getProfileUc: AccountGetProfileUc,
    private readonly updateProfileUc: AccountUpdateProfileUc,
    private readonly changePasswordUc: AccountChangePasswordUc,
  ) {}

  @Get('profile')
  async getProfile(@CurrentUser() currentUser: CurrentUserType): Promise<AccountUpdateProfileResponseType> {
    return this.getProfileUc.execute({ currentUser });
  }

  @Put('profile')
  async updateProfile(
    @Body(new ZodValidationPipe(AccountUpdateProfileRequestSchema)) body: AccountUpdateProfileRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<AccountUpdateProfileResponseType> {
    return this.updateProfileUc.execute({ dto: body, currentUser });
  }

  @Put('change-password')
  async changePassword(
    @Body(new ZodValidationPipe(AccountChangePasswordRequestSchema)) body: AccountChangePasswordRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.changePasswordUc.execute({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      currentUser,
    });
  }
}
