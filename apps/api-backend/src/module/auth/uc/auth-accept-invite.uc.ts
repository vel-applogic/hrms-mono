import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { AuthAcceptInviteRequestType, OperationStatusResponseType } from '@repo/dto';
import { CommonLoggerService, IUseCase, PrismaService, UserDao, UserInviteDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { PasswordService } from '#src/service/password.service.js';

import { BaseAuthUseCase } from './_base-auth.uc.js';

type Params = {
  dto: AuthAcceptInviteRequestType;
};

@Injectable()
export class AuthAcceptInviteUc extends BaseAuthUseCase implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userDao: UserDao,
    private readonly userInviteDao: UserInviteDao,
    private readonly passwordService: PasswordService,
  ) {
    super(prisma, logger, userDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Accepting invite', { userId: params.dto.userId });
    const { inviteId } = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.activateUser({ dto: params.dto, tx });
      await this.markInviteAccepted({ inviteId, tx });
    });

    return { success: true, message: 'Account activated successfully. You can now log in.' };
  }

  private async validate(params: Params): Promise<{ inviteId: number }> {
    const user = await this.userDao.getById({ id: params.dto.userId });
    if (!user) {
      throw new ApiBadRequestError('Invite link is invalid');
    }

    const invite = await this.userInviteDao.findByUserAndKey({ userId: params.dto.userId, inviteKey: params.dto.inviteKey });
    if (!invite) {
      throw new ApiBadRequestError('Invite link is invalid or has expired');
    }
    if (invite.acceptedAt) {
      throw new ApiBadRequestError('This invite has already been accepted');
    }

    return { inviteId: invite.id };
  }

  private async activateUser(params: { dto: AuthAcceptInviteRequestType; tx: Prisma.TransactionClient }): Promise<void> {
    const hashedPassword = await this.passwordService.hash(params.dto.password);
    await this.userDao.update({
      id: params.dto.userId,
      data: {
        firstname: params.dto.firstname,
        lastname: params.dto.lastname,
        password: hashedPassword,
        isActive: true,
      },
      tx: params.tx,
    });
  }

  private async markInviteAccepted(params: { inviteId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.userInviteDao.markAccepted({ id: params.inviteId, tx: params.tx });
  }
}
