import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { GenderDbEnum } from '@repo/db';
import type { AdminUserCreateRequestType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, UserRoleDtoEnum } from '@repo/dto';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  OrganisationDao,
  OrganisationHasUserDao,
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
    organisationHasUserDao: OrganisationHasUserDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly organisationDao: OrganisationDao,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao, organisationHasUserDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Inviting user', { email: params.dto.email });
    const { organisationName } = await this.validate(params);

    const { userId, inviteKey, isNew } = await this.transaction(async (tx) => {
      const { userId, isNew } = await this.upsertUser(params, tx);
      await this.createOrgMembership({ userId, currentUser: params.currentUser, tx });
      const inviteKey = await this.createInvite({
        userId,
        organisationId: params.currentUser.organisationId,
        invitedById: params.currentUser.id,
        tx,
      });
      return { userId, inviteKey, isNew };
    });

    void this.sendInviteEmail({ userId, email: params.dto.email, inviteKey, organisationName });
    if (isNew) {
      void this.recordActivity(params, userId);
    }

    return { success: true, message: 'Invitation sent successfully' };
  }

  private async validate(params: Params): Promise<{ organisationName: string }> {
    if (params.currentUser.organisationId <= 0) {
      throw new ApiBadRequestError('Organisation context is required to invite users');
    }

    const org = await this.organisationDao.findById({ id: params.currentUser.organisationId });
    if (!org) {
      throw new ApiBadRequestError('Organisation not found');
    }

    return { organisationName: org.name };
  }

  private async upsertUser(params: Params, tx: Prisma.TransactionClient): Promise<{ userId: number; isNew: boolean }> {
    const existingUser = await this.userDao.getByEmail({ email: params.dto.email });
    if (existingUser) {
      return { userId: existingUser.id, isNew: false };
    }
    const userId = await this.createUser({ email: params.dto.email, tx });
    return { userId, isNew: true };
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
        gender: GenderDbEnum.other,
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
    if (!this.organisationHasUserDao) return;
    await this.organisationHasUserDao.upsert({
      organisationId: params.currentUser.organisationId,
      userId: params.userId,
      roles: [userRoleDtoEnumToDbEnum(UserRoleDtoEnum.admin)],
      tx: params.tx,
    });
  }

  private async createInvite(params: {
    userId: number;
    organisationId: number;
    invitedById: number;
    tx: Prisma.TransactionClient;
  }): Promise<string> {
    const inviteKey = this.passwordService.makeRandomKey();
    await this.userInviteDao.create({
      data: {
        user: { connect: { id: params.userId } },
        organisation: { connect: { id: params.organisationId } },
        invitedBy: { connect: { id: params.invitedById } },
        inviteKey,
      },
      tx: params.tx,
    });
    return inviteKey;
  }

  private async sendInviteEmail(params: { userId: number; email: string; inviteKey: string; organisationName: string }): Promise<void> {
    await this.emailService.sendUserInvite({
      userId: params.userId,
      email: params.email,
      emailData: {
        userDisplayName: params.email,
        organisationName: params.organisationName,
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
