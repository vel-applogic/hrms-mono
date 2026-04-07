import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { AdminUserDetailResponseType, AdminUserUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';

import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  id: number;
  dto: AdminUserUpdateRequestType;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserUpdateUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating user', { id: params.id });
    const existingUser = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.applyUpdate(params, tx);
    });

    const updatedUser = await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
    void this.recordActivity(params, existingUser, updatedUser);

    return { success: true, message: 'User updated successfully' };
  }

  private async validate(params: Params): Promise<AdminUserDetailResponseType> {
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }

  private async applyUpdate(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    const updateData: Prisma.UserUpdateInput = {};
    if (params.dto.firstname !== undefined) updateData.firstname = params.dto.firstname;
    if (params.dto.lastname !== undefined) updateData.lastname = params.dto.lastname;
    if (params.dto.isActive !== undefined) updateData.isActive = params.dto.isActive;
    await this.userDao.update({ id: params.id, data: updateData, tx });
  }

  private async recordActivity(params: Params, oldUser: AdminUserDetailResponseType, updatedUser: AdminUserDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        email: oldUser.email,
        firstname: oldUser.firstname,
        lastname: oldUser.lastname,
        isActive: oldUser.isActive,
      },
      newValues: {
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        isActive: updatedUser.isActive,
      },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User updated',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.id }],
    });
  }
}
