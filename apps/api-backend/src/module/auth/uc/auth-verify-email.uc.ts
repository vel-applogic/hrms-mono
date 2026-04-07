import { Injectable } from '@nestjs/common';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  AuthVerifyEmailRequestType,
  OperationStatusResponseType,
  UserRoleDtoEnum,
} from '@repo/dto';
import type { Prisma } from '@repo/db';
import { AuditService, CommonLoggerService, getErrorMessage, IUseCase, PrismaService, TrackQuery, UserDao, UserVerifyEmailDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { BaseAuthUseCase } from './_base-auth.uc.js';

type Params = {
  dto: AuthVerifyEmailRequestType;
};

@Injectable()
@TrackQuery()
export class AuthVerifyEmailUseCase extends BaseAuthUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly userVerifyEmailDao: UserVerifyEmailDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, userDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    try {
      const { keyId } = await this.validate(params);

      await this.transaction(async (tx) => {
        await this.activateUser(params.dto.userId, tx);
        await this.markKeyVerified(keyId, tx);
      });

      void this.recordActivitySuccess({ userId: params.dto.userId });
      return { success: true, message: 'Email address has been verified' };
    } catch (err) {
      void this.recordActivityFailure({ userId: params.dto.userId, err });
      throw err;
    }
  }

  private async validate(params: Params): Promise<{ keyId: number }> {
    await this.getUserByIdOrThorw(params.dto.userId);
    const keyId = await this.validateKey({ userId: params.dto.userId, key: params.dto.key });
    return { keyId };
  }

  private async activateUser(userId: number, tx: Prisma.TransactionClient): Promise<void> {
    await this.userDao.update({ id: userId, data: { isActive: true }, tx });
  }

  private async markKeyVerified(keyId: number, tx: Prisma.TransactionClient): Promise<void> {
    await this.userVerifyEmailDao.updateById({ id: keyId, data: { verifiedAt: new Date() }, tx });
  }

  private async validateKey(params: { userId: number; key: string }): Promise<number> {
    const result = await this.userVerifyEmailDao.getByUserIdAndKey({ userId: params.userId, key: params.key });
    if (!result || result.verifiedAt) {
      throw new ApiBadRequestError('Verification key is invalid');
    }
    return result.id;
  }

  private async recordActivitySuccess(params: { userId: number }): Promise<void> {
    const user = await this.getUserByIdOrThorw(params.userId);
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.authentication,
      eventType: AuditEventTypeDtoEnum.email_verify,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: {
        id: user.id,
        roles: user.roles,
        isSuperAdmin: false,
        organizationId: 0,
        email: user.email,
        firstname: user.firstname ?? '',
        lastname: user.lastname ?? '',
        isActive: user.isActive,
      },
      description: 'Email verified successfully',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.userId }],
    });
  }

  private async recordActivityFailure(params: { userId: number; err: unknown }): Promise<void> {
    const errorMessage = getErrorMessage(params.err);

    await this.auditService.recordActivityAnonymous({
      eventGroup: AuditEventGroupDtoEnum.authentication,
      eventType: AuditEventTypeDtoEnum.email_verify,
      status: AuditActivityStatusDtoEnum.failure,
      description: `Email verification failed for userId: ${params.userId} - ${errorMessage}`,
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user, entityId: params.userId }],
    });
  }
}
