import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import type { AccountUpdateProfileRequestType, AdminUserDetailResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import type { CurrentUserType, IUseCase } from '@repo/nest-lib';
import { AuditService, BaseUc, CommonLoggerService, PrismaService, TrackQuery, UserDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

type Params = {
  dto: AccountUpdateProfileRequestType;
  currentUser: CurrentUserType;
};

@Injectable()
@TrackQuery()
export class AccountUpdateProfileUc extends BaseUc implements IUseCase<Params, AdminUserDetailResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<AdminUserDetailResponseType> {
    this.logger.i('Updating account profile', { userId: params.currentUser.id });
    await this.validate(params);

    await this.transaction(async (tx) => {
      await this.updateUser(params, tx);
    });

    void this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Account profile updated',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user_admin, entityId: params.currentUser.id }],
    });

    return await this.getUser(params);
  }

  private async validate(params: Params): Promise<void> {
    await this.getUser(params);
  }

  private async updateUser(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.userDao.update({
      id: params.currentUser.id,
      data: { firstname: params.dto.firstname, lastname: params.dto.lastname },
      tx,
    });
  }

  private async getUser(params: Params): Promise<AdminUserDetailResponseType> {
    const user = await this.userDao.getById({ id: params.currentUser.id });
    if (!user) {
      throw new ApiBadRequestError('User not found');
    }
    return this.dbToAdminUserDetailResponse(user);
  }
}
