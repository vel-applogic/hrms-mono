import { Injectable } from '@nestjs/common';
import { PlanEnum, UserRoleDbEnum } from '@repo/db';
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
export class AdminUserDowngradePlanUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Downgrading user plan', { id: params.id });

    await this.validate(params);

    await this.downgradePlan(params.id);
    void this.recordActivity(params);

    return { success: true, message: 'User plan downgraded successfully' };
  }

  async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }

    if (existing.role === UserRoleDbEnum.admin) {
      throw new ApiError('Admin users cannot be downgraded', 400);
    }

    if (existing.plan === PlanEnum.free) {
      throw new ApiError('User is already on free plan', 400);
    }
  }

  async downgradePlan(id: number): Promise<void> {
    await this.userDao.update({ id, data: { plan: PlanEnum.free } });
  }

  private async recordActivity(params: Params): Promise<void> {
    const changes = this.computeChanges({
      oldValues: { plan: PlanEnum.premium },
      newValues: { plan: PlanEnum.free },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.downgrade_plan,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User plan downgraded to free',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.id }],
    });
  }
}
