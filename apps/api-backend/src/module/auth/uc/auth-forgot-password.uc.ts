import { Injectable } from '@nestjs/common';
import {
  AdminUserDetailResponseType,
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  AuthForgotPasswordRequestType,
  OperationStatusResponseType,
  UserRoleDtoEnum,
} from '@repo/dto';
import { AuditService, CommonLoggerService, getErrorMessage, IUseCase, PrismaService, TrackQuery, UserDao, UserForgotPasswordDao } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';
import { v4 as uuid } from 'uuid';

import { AppConfigService } from '#src/config/app-config.service.js';
import { EmailService } from '#src/service/email/email.service.js';

import { BaseAuthUseCase } from './_base-auth.uc.js';

type Params = {
  dto: AuthForgotPasswordRequestType;
};
@Injectable()
@TrackQuery()
export class AuthForgotPasswordUseCase extends BaseAuthUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private userForgotPasswordDao: UserForgotPasswordDao,
    private readonly emailService: EmailService,
    private readonly appConfigService: AppConfigService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    try {
      const user = await this.validate(params);
      await this.processForgotPasswordRequest(user);

      void this.recordActivitySuccess({ user });

      return { success: true, message: 'Link has been sent to your email to reset your password' };
    } catch (err) {
      void this.recordActivityFailure({ email: params.dto.email, err: err });
      throw err;
    }
  }

  async validate(params: Params): Promise<AdminUserDetailResponseType> {
    const user = await this.userDao.getByEmail({ email: params.dto.email });
    if (!user) {
      throw new ApiFieldValidationError('email', 'Email is not registerd with an account');
    }
    return this.dbToUserResponse(user);
  }

  private async processForgotPasswordRequest(user: AdminUserDetailResponseType): Promise<string> {
    const key = uuid();
    await this.transaction(async (tx) => {
      await this.userForgotPasswordDao.create({ data: { user: { connect: { id: user.id } }, forgotPasswordKey: key, forgotPasswordKeyCreatedAt: new Date() }, tx: tx });
      await this.sendEmail({ user, key });
    });
    return key;
  }

  private async sendEmail(params: { user: AdminUserDetailResponseType; key: string }): Promise<void> {
    const webAppBaseUrl = this.appConfigService.webAppBaseUrl;
    await this.emailService.sendForgotPasswordRequestEmail({
      userId: params.user.id,
      email: params.user.email!,
      emailData: {
        userDisplayName: `${params.user.firstname} ${params.user.lastname}`,
        link: `${webAppBaseUrl}/auth/reset-password/${params.user.id}/${params.key}`,
      },
    });
  }

  private async recordActivitySuccess(params: { user: AdminUserDetailResponseType }): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.authentication,
      eventType: AuditEventTypeDtoEnum.password_reset_request,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: {
        id: params.user.id,
        roles: params.user.roles,
        email: params.user.email,
        organizationId: 0,
        firstname: params.user.firstname,
        lastname: params.user.lastname,
        isActive: params.user.isActive,
      },
      description: 'Password reset requested successfully',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.user.id }],
    });
  }

  private async recordActivityFailure(params: { email: string; err: unknown }): Promise<void> {
    const errorMessage = getErrorMessage(params.err);

    await this.auditService.recordActivityAnonymous({
      eventGroup: AuditEventGroupDtoEnum.authentication,
      eventType: AuditEventTypeDtoEnum.password_reset_request,
      status: AuditActivityStatusDtoEnum.failure,
      description: `Password reset request failed for email: ${params.email} - ${errorMessage}`,
    });
  }
}
