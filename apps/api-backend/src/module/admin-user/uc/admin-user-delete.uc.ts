import { Injectable } from '@nestjs/common';
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
export class AdminUserDeleteUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting user (soft)', { id: params.id });

    await this.validate(params);

    await this.delete(params.id);
    void this.recordActivity(params);

    return { success: true, message: 'User deleted successfully' };
  }

  async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }
  }

  async delete(id: number): Promise<void> {
    await this.userDao.delete({ id });
  }

  private async recordActivity(params: Params): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User deleted',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.id }],
    });
  }
}
