import { Injectable } from '@nestjs/common';
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

  async execute(params: Params): Promise<AdminUserDetailResponseType> {
    this.logger.i('Updating account profile', { userId: params.currentUser.id });

    await this.validate(params);
    await this.updateProfile(params);

    void this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Account profile updated',
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.user_admin, entityId: params.currentUser.id }],
    });

    return this.getUser(params);
  }

  async validate(params: Params): Promise<void> {
    await this.getUser(params);
  }

  async updateProfile(params: Params): Promise<void> {
    await this.transaction(async (tx) => {
      await this.userDao.update({
        id: params.currentUser.id,
        data: { firstname: params.dto.firstname, lastname: params.dto.lastname },
        tx,
      });
    });
  }

  async getUser(params: Params): Promise<AdminUserDetailResponseType> {
    const user = await this.userDao.getById({ id: params.currentUser.id });
    if (!user) {
      throw new ApiBadRequestError('User not found');
    }
    return this.dbToAdminUserDetailResponse(user);
  }
}
