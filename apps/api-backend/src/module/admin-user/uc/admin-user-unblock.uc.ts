import { Injectable } from '@nestjs/common';
import { UserRoleDbEnum } from '@repo/db';
import type { OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  id: number;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserUnblockUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Unblocking user', { id: params.id });

    await this.validate(params);

    await this.unblock(params.id);
    void this.recordActivity(params);

    return { success: true, message: 'User unblocked successfully' };
  }

  async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }

    // if (existing.role === UserRoleDbEnum.admin) {
    //   throw new ApiError('Admin users cannot be unblocked', 400);
    // }
  }

  async unblock(id: number): Promise<void> {
    await this.userDao.update({ id, data: { isActive: true } });
  }

  private async recordActivity(params: Params): Promise<void> {
    const changes = this.computeChanges({
      oldValues: { isActive: false },
      newValues: { isActive: true },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.unblock_user,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User unblocked',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.id }],
    });
  }
}
