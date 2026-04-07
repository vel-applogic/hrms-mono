import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  id: number;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserDeleteUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting user', { id: params.id });
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.deactivateUser(params, tx);
    });

    void this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User deactivated',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.id }],
    });

    return { success: true, message: 'User removed successfully' };
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiBadRequestError('User not found');
    }
  }

  private async deactivateUser(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.userDao.update({
      id: params.id,
      data: { isActive: false },
      tx,
    });
  }
}
