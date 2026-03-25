import { Injectable } from '@nestjs/common';
import type { Prisma, User } from '@repo/db';
import type { AdminUserCreateRequestType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  OrganizationHasUserDao,
  PrismaService,
  UserDao,
  userRoleDtoEnumToDbEnum,
  UserVerifyEmailDao,
} from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

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
    private readonly userVerifyEmailDao: UserVerifyEmailDao,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao, organizationHasUserDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating user', { email: params.dto.email });

    await this.validate(params);

    const { createdUser, verifyKey } = await this.transaction(async (tx) => {
      const createdUser = await this.create({ dto: params.dto, tx });
      const verifyKey = await this.createVerifyEmailKey({ userId: createdUser.id, tx });
      await this.createOrgMembership({ dto: params.dto, userId: createdUser.id, currentUser: params.currentUser, tx });
      return { createdUser, verifyKey };
    });

    void this.sendVerifyEmail({ user: createdUser, key: verifyKey });
    void this.recordActivity(params, createdUser);

    return { success: true, message: 'User created successfully' };
  }

  async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getByEmail({ email: params.dto.email });
    if (existing) {
      throw new ApiFieldValidationError('email', 'User with this email already exists');
    }
  }

  async create(params: { dto: AdminUserCreateRequestType; tx: Prisma.TransactionClient }): Promise<User> {
    const hashedPassword = await this.passwordService.hash(params.dto.password);

    return this.userDao.create({
      data: {
        email: params.dto.email,
        firstname: params.dto.firstname,
        lastname: params.dto.lastname,
        password: hashedPassword,
        isActive: false,
      },
      tx: params.tx,
    });
  }

  private async createOrgMembership(params: { dto: AdminUserCreateRequestType; userId: number; currentUser: CurrentUserType; tx: Prisma.TransactionClient }): Promise<void> {
    if (params.currentUser.organizationId <= 0 || !this.organizationHasUserDao) return;

    await this.organizationHasUserDao.upsert({
      organizationId: params.currentUser.organizationId,
      userId: params.userId,
      roles: params.dto.roles.map((r) => userRoleDtoEnumToDbEnum(r)),
      tx: params.tx,
    });
  }

  private async createVerifyEmailKey(params: { userId: number; tx: Prisma.TransactionClient }): Promise<string> {
    const key = this.passwordService.makeRandomKey();
    await this.userVerifyEmailDao.create({
      data: { user: { connect: { id: params.userId } }, verifyEmailKey: key },
      tx: params.tx,
    });
    return key;
  }

  private async sendVerifyEmail(params: { user: User; key: string }): Promise<void> {
    await this.emailService.sendUserEmailVerifyRequest({
      userId: params.user.id,
      email: params.user.email!,
      emailData: {
        userDisplayName: `${params.user.firstname} ${params.user.lastname}`,
        link: `${this.appConfigService.webAppBaseUrl}/auth/verify-email/${params.user.id}/${params.key}`,
      },
    });
  }

  private async recordActivity(params: Params, createdUser: User): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        email: createdUser.email,
        firstname: createdUser.firstname,
        lastname: createdUser.lastname,
      },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'User created',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: createdUser.id }],
    });
  }
}
