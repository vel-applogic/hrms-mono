import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AdminUserDetailResponseType,
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  AuthResetPasswordRequestType,
  OperationStatusResponseType,
  UserRoleDtoEnum,
} from '@repo/dto';
import { AuditService, CommonLoggerService, getErrorMessage, IUseCase, PrismaService, TrackQuery, UserDao, UserForgotPasswordDao, UserVerifyEmailDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { AppConfigService } from '#src/config/app-config.service.js';
import { EmailService } from '#src/service/email/email.service.js';
import { PasswordService } from '#src/service/password.service.js';

import { BaseAuthUseCase } from './_base-auth.uc.js';

type Params = {
  dto: AuthResetPasswordRequestType;
};
@Injectable()
@TrackQuery()
export class AuthResetPasswordUseCase extends BaseAuthUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private userForgotPasswordDao: UserForgotPasswordDao,
    private userVerifyEmailDao: UserVerifyEmailDao,
    private emailService: EmailService,
    private passwordService: PasswordService,
    private appConfigService: AppConfigService,
    private auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    try {
      const { user, keyId } = await this.validate(params);
      const randomKey = this.passwordService.makeRandomKey();

      await this.transaction(async (tx) => {
        await this.updatePassword({ keyId: keyId, dto: params.dto, tx: tx });
        if (!user.isActive) {
          await this.createEmailVerifyKey({ userId: params.dto.userId, key: randomKey, tx: tx });
          await this.sendEmail(user, randomKey);
        }
      });

      void this.recordActivitySuccess({ user });

      return { success: true, message: 'Password has been successfully reset.' };
    } catch (err) {
      void this.recordActivityFailure({ userId: params.dto.userId, err });
      throw err;
    }
  }

  async validate(params: Params): Promise<{ user: AdminUserDetailResponseType; keyId: number }> {
    const user = await this.getUserByIdOrThorw(params.dto.userId);
    if (!user.isActive) {
      throw new ApiBadRequestError('User is not active');
    }

    const keyId = await this.validateKey({ userId: params.dto.userId, key: params.dto.key });

    return { keyId, user };
  }

  private async validateKey(params: { userId: number; key: string }): Promise<number> {
    const result = await this.userForgotPasswordDao.getByUserIdAndKey({ userId: params.userId, key: params.key });
    if (!result) {
      throw new ApiBadRequestError('Reset password link is invalid');
    }
    if (result.resetAt) {
      throw new ApiBadRequestError('Reset password link is already used');
    }
    return result.id;
  }

  private async updatePassword(params: { keyId: number; dto: AuthResetPasswordRequestType; tx: Prisma.TransactionClient }): Promise<void> {
    await this.userDao.update({
      id: params.dto.userId,
      data: {
        password: this.passwordService.encriptPassword(params.dto.password),
      },
      tx: params.tx,
    });

    await this.userForgotPasswordDao.updateById({
      id: params.keyId,
      data: {
        resetAt: new Date(),
      },
      tx: params.tx,
    });
  }

  private async createEmailVerifyKey(params: { userId: number; key: string; tx: Prisma.TransactionClient }): Promise<void> {
    await this.userVerifyEmailDao.create({
      data: {
        user: { connect: { id: params.userId } },
        verifyEmailKey: params.key,
      },
      tx: params.tx,
    });
  }

  private async sendEmail(user: AdminUserDetailResponseType, randomKey: string): Promise<void> {
    await this.emailService.sendUserEmailVerifyRequest({
      userId: user.id,
      email: user.email!,
      emailData: {
        userDisplayName: `${user.firstname} ${user.lastname}`,
        link: `${this.appConfigService.webAppBaseUrl}/auth/verify-email/${user.id}/${randomKey}`,
      },
    });
  }

  private async recordActivitySuccess(params: { user: AdminUserDetailResponseType }): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.authentication,
      eventType: AuditEventTypeDtoEnum.password_reset,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: {
        id: params.user.id,
        roles: params.user.roles,
        organizationId: 0,
        email: params.user.email!,
        firstname: params.user.firstname,
        lastname: params.user.lastname,
        isActive: params.user.isActive,
      },
      description: 'Password reset successfully',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.user.id }],
    });
  }

  private async recordActivityFailure(params: { userId: number; err: unknown }): Promise<void> {
    const errorMessage = getErrorMessage(params.err);

    await this.auditService.recordActivityAnonymous({
      eventGroup: AuditEventGroupDtoEnum.authentication,
      eventType: AuditEventTypeDtoEnum.password_reset,
      status: AuditActivityStatusDtoEnum.failure,
      description: `Password reset failed for userId: ${params.userId} - ${errorMessage}`,
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.userId }],
    });
  }
}
