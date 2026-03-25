import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@repo/db'; // Prisma used for TransactionClient
import type { AdminUserUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

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

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating user', { id: params.id });

    const existingUser = await this.validate(params);

    const updatedUser = await this.transaction(async (tx) => {
      return this.update({ params, tx });
    });

    void this.recordActivity(params, existingUser, updatedUser);

    return { success: true, message: 'User updated successfully' };
  }

  async validate(params: Params): Promise<User> {
    const existing = await this.userDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('User not found', 404);
    }
    return existing;
  }

  async update(params: { params: Params; tx: Prisma.TransactionClient }): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};
    if (params.params.dto.firstname !== undefined) updateData.firstname = params.params.dto.firstname;
    if (params.params.dto.lastname !== undefined) updateData.lastname = params.params.dto.lastname;
    if (params.params.dto.isActive !== undefined) updateData.isActive = params.params.dto.isActive;
    return this.userDao.update({ id: params.params.id, data: updateData, tx: params.tx });
  }

  private async recordActivity(params: Params, oldUser: User, updatedUser: User): Promise<void> {
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
