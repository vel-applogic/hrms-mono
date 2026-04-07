import { Injectable } from '@nestjs/common';
import type { AdminUserDetailResponseType } from '@repo/dto';
import type { CurrentUserType, IUseCase } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class AccountGetProfileUc extends BaseUc implements IUseCase<Params, AdminUserDetailResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly userDao: UserDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<AdminUserDetailResponseType> {
    this.logger.i('Getting account profile', { userId: params.currentUser.id });
    await this.validate(params);
    return await this.getProfile(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async getProfile(params: Params): Promise<AdminUserDetailResponseType> {
    const user = await this.userDao.getById({ id: params.currentUser.id });
    if (!user) {
      throw new ApiBadRequestError('User not found');
    }
    return this.dbToAdminUserDetailResponse(user);
  }
}
