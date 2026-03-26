import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { AdminUserCreateRequestType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, UserRoleDtoEnum } from '@repo/dto';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  OrganizationDao,
  OrganizationHasUserDao,
  PrismaService,
  UserDao,
  UserInviteDao,
  userRoleDtoEnumToDbEnum,
} from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { AppConfigService } from '#src/config/app-config.service.js';
import { EmailService } from '#src/service/email/email.service.js';

import { PasswordService } from '../../../service/password.service.js';
import { BaseAdminUserUc } from './_base-admin-user.uc.js';

type Params = {
  dto: AdminUserCreateRequestType;
  currentUser: CurrentUserType;
};

@Injectable()
export class AdminUserCreateUc extends BaseAdminUserUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    organizationHasUserDao: OrganizationHasUserDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly organizationDao: OrganizationDao,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao, organizationHasUserDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Inviting user', { email: params.dto.email });

    if (params.currentUser.organizationId <= 0) {
      throw new ApiBadRequestError('Organization context is required to invite users');
    }

    const org = await this.organizationDao.findById({ id: params.currentUser.organizationId });
    if (!org) {
      throw new ApiBadRequestError('Organization not found');
    }

    const { userId, inviteKey, isNew } = await this.transaction(async (tx) => {
      const existingUser = await this.userDao.getByEmail({ email: params.dto.email });
      let userId: number;
      let isNew = false;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        userId = await this.createUser({ email: params.dto.email, tx });
        isNew = true;
      }

      await this.createOrgMembership({ userId, currentUser: params.currentUser, tx });

      const inviteKey = await this.createInvite({
        userId,
        organizationId: params.currentUser.organizationId,
        invitedById: params.currentUser.id,
        tx,
      });

      return { userId, inviteKey, isNew };
    });

    void this.sendInviteEmail({ userId, email: params.dto.email, inviteKey, organizationName: org.name });
    if (isNew) {
      void this.recordActivity(params, userId);
    }

    return { success: true, message: 'Invitation sent successfully' };
  }

  private async createUser(params: { email: string; tx: Prisma.TransactionClient }): Promise<number> {
    const randomPassword = this.passwordService.makeRandomKey();
    const hashedPassword = await this.passwordService.hash(randomPassword);
    return this.userDao.create({
      data: {
        email: params.email,
        firstname: '',
        lastname: '',
        password: hashedPassword,
        isActive: false,
      },
      tx: params.tx,
    });
  }

  private async createOrgMembership(params: {
    userId: number;
    currentUser: CurrentUserType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    if (!this.organizationHasUserDao) return;
    await this.organizationHasUserDao.upsert({
      organizationId: params.currentUser.organizationId,
      userId: params.userId,
      roles: [userRoleDtoEnumToDbEnum(UserRoleDtoEnum.admin)],
      tx: params.tx,
    });
  }

  private async createInvite(params: {
    userId: number;
    organizationId: number;
    invitedById: number;
    tx: Prisma.TransactionClient;
  }): Promise<string> {
    const inviteKey = this.passwordService.makeRandomKey();
    await this.userInviteDao.create({
      data: {
        user: { connect: { id: params.userId } },
        organization: { connect: { id: params.organizationId } },
        invitedBy: { connect: { id: params.invitedById } },
        inviteKey,
      },
      tx: params.tx,
    });
    return inviteKey;
  }

  private async sendInviteEmail(params: { userId: number; email: string; inviteKey: string; organizationName: string }): Promise<void> {
    await this.emailService.sendUserInvite({
      userId: params.userId,
      email: params.email,
      emailData: {
        userDisplayName: params.email,
        organizationName: params.organizationName,
        link: `${this.appConfigService.webAppBaseUrl}/auth/accept-invite/${params.userId}/${params.inviteKey}`,
      },
    });
  }

  private async recordActivity(params: Params, userId: number): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: { email: params.dto.email },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User invited',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: userId }],
    });
  }
}
