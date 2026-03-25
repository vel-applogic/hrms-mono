import { Injectable } from '@nestjs/common';
import type { OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, UserRoleDtoEnum } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  id: number;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserBlockUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Blocking user', { id: params.id });

    await this.validate(params);

    await this.block(params.id);
    void this.recordActivity(params);

    return { success: true, message: 'User blocked successfully' };
  }

  async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }

    // if (existing.roles.includes(UserRoleDtoEnum.admin)) {
    //   throw new ApiError('Admin users cannot be blocked', 400);
    // }
  }

  async block(id: number): Promise<void> {
    await this.userDao.update({ id, data: { isActive: false } });
  }

  private async recordActivity(params: Params): Promise<void> {
    const changes = this.computeChanges({
      oldValues: { isActive: true },
      newValues: { isActive: false },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.block_user,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User blocked',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.id }],
    });
  }
}
