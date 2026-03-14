import { Injectable } from '@nestjs/common';
import type { Prisma, User, UserRoleDbEnum } from '@repo/db';
import type { AdminUserUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { PasswordService } from '#src/service/password.service.js';

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
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating user', { id: params.id });

    const existingUser = await this.validate(params);

    const updatedUser = await this.update(params);
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

  async update(params: Params): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};
    if (params.dto.email !== undefined) updateData.email = params.dto.email;
    if (params.dto.firstname !== undefined) updateData.firstname = params.dto.firstname;
    if (params.dto.lastname !== undefined) updateData.lastname = params.dto.lastname;
    if (params.dto.role !== undefined) updateData.role = params.dto.role as UserRoleDbEnum;
    if (params.dto.isActive !== undefined) updateData.isActive = params.dto.isActive;
    if (params.dto.password !== undefined) {
      updateData.password = await this.passwordService.hash(params.dto.password);
    }
    return this.userDao.update({ id: params.id, data: updateData });
  }

  private async recordActivity(params: Params, oldUser: User, updatedUser: User): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        email: oldUser.email,
        firstname: oldUser.firstname,
        lastname: oldUser.lastname,
        role: oldUser.role,
        isActive: oldUser.isActive,
      },
      newValues: {
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        role: updatedUser.role,
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
