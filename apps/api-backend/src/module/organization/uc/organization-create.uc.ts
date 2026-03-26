import { Injectable } from '@nestjs/common';
import { UserRoleDbEnum } from '@repo/db';
import type { OrganizationCreateRequestType, OrganizationResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import {
  CommonLoggerService,
  IUseCase,
  OrganizationDao,
  OrganizationHasUserDao,
  PrismaService,
  UserDao,
  UserInviteDao,
} from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { AppConfigService } from '#src/config/app-config.service.js';
import { EmailService } from '#src/service/email/email.service.js';
import { PasswordService } from '#src/service/password.service.js';

import { BaseOrganizationUc } from './_base-organization.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: OrganizationCreateRequestType;
};

@Injectable()
export class OrganizationCreateUc extends BaseOrganizationUc implements IUseCase<Params, OrganizationResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    organizationDao: OrganizationDao,
    private readonly userDao: UserDao,
    private readonly organizationHasUserDao: OrganizationHasUserDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly passwordService: PasswordService,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
  ) {
    super(prisma, logger, organizationDao);
  }

  async execute(params: Params): Promise<OrganizationResponseType> {
    this.assertSuperAdmin(params.currentUser);
    this.logger.i('Creating organization', { name: params.dto.name, email: params.dto.email });

    const existing = await this.organizationDao.findByName({ name: params.dto.name });
    if (existing) {
      throw new ApiFieldValidationError('name', 'Organization name already exists');
    }

    const existingUser = await this.userDao.getByEmail({ email: params.dto.email });

    const { organizationId, userId, inviteKey } = await this.transaction(async (tx) => {
      const organizationId = await this.organizationDao.create({
        data: { name: params.dto.name },
        tx,
      });

      let userId: number;

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const randomPassword = this.passwordService.makeRandomKey();
        const hashedPassword = await this.passwordService.hash(randomPassword);

        userId = await this.userDao.create({
          data: {
            email: params.dto.email,
            firstname: params.dto.email.split('@')[0] ?? '',
            lastname: '',
            password: hashedPassword,
            isActive: false,
          },
          tx,
        });
      }

      await this.organizationHasUserDao.upsert({
        organizationId,
        userId,
        roles: [UserRoleDbEnum.admin],
        tx,
      });

      const inviteKey = this.passwordService.makeRandomKey();
      await this.userInviteDao.create({
        data: {
          user: { connect: { id: userId } },
          organization: { connect: { id: organizationId } },
          invitedBy: { connect: { id: params.currentUser.id } },
          inviteKey,
        },
        tx,
      });

      return { organizationId, userId, inviteKey };
    });

    void this.sendInviteEmail({
      userId,
      email: params.dto.email,
      inviteKey,
      organizationName: params.dto.name,
    });

    return await this.getOrganizationResponseById(organizationId);
  }

  private async sendInviteEmail(params: { userId: number; email: string; inviteKey: string; organizationName: string }): Promise<void> {
    try {
      await this.emailService.sendUserInvite({
        userId: params.userId,
        email: params.email,
        emailData: {
          userDisplayName: params.email,
          organizationName: params.organizationName,
          link: `${this.appConfigService.webAppBaseUrl}/auth/accept-invite/${params.userId}/${params.inviteKey}`,
        },
      });
    } catch (err) {
      this.logger.e('Failed to send organization invite email', { email: params.email });
    }
  }
}
