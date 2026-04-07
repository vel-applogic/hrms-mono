import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import type { CurrentUserType, IUseCase } from '@repo/nest-lib';
import { AuditService, CommonLoggerService, getErrorMessage, PrismaService, TrackQuery, UserDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { PasswordService } from '#src/service/password.service.js';

type Params = {
  currentPassword: string;
  newPassword: string;
  currentUser: CurrentUserType;
};

@Injectable()
@TrackQuery()
export class AccountChangePasswordUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userDao: UserDao,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
  ) {}

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Changing account password', { userId: params.currentUser.id });

    try {
      await this.validate(params);
      const hashedPassword = await this.passwordService.hash(params.newPassword);
      await this.prisma.$transaction(async (tx) => {
        await this.updatePassword(params, hashedPassword, tx);
      });

      void this.auditService.recordActivity({
        eventGroup: AuditEventGroupDtoEnum.authentication,
        eventType: AuditEventTypeDtoEnum.password_reset,
        status: AuditActivityStatusDtoEnum.success,
        currentUser: params.currentUser,
        description: 'Account password changed successfully',
        relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user_admin, entityId: params.currentUser.id }],
      });

      return { success: true, message: 'Password changed successfully.' };
    } catch (err) {
      const errorMessage = getErrorMessage(err);

      void this.auditService.recordActivity({
        eventGroup: AuditEventGroupDtoEnum.authentication,
        eventType: AuditEventTypeDtoEnum.password_reset,
        status: AuditActivityStatusDtoEnum.failure,
        currentUser: params.currentUser,
        description: `Account password change failed: ${errorMessage}`,
        relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user_admin, entityId: params.currentUser.id }],
      });

      throw err;
    }
  }

  private async validate(params: Params): Promise<void> {
    const user = await this.userDao.getById({ id: params.currentUser.id });
    if (!user) {
      throw new ApiBadRequestError('User not found');
    }
    const isCurrentPasswordValid = await this.passwordService.compare(params.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new ApiBadRequestError('Current password is incorrect');
    }
  }

  private async updatePassword(params: Params, hashedPassword: string, tx: Prisma.TransactionClient): Promise<void> {
    await this.userDao.update({
      id: params.currentUser.id,
      data: { password: hashedPassword },
      tx,
    });
  }
}
