import { User } from '@repo/db';
import { AdminUserDetailResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, planDbEnumToDtoEnum, PrismaService, UserDao, userRoleDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

export class BaseAdminUserUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly userDao: UserDao,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<AdminUserDetailResponseType | undefined> {
    const user = await this.userDao.getById({ id });
    if (!user) {
      return undefined;
    }

    return this.dbToAdminUserDetailResponse(user);
  }

  async getByIdOrThrow(id: number): Promise<AdminUserDetailResponseType> {
    const chapter = await this.getById(id);
    if (!chapter) {
      throw new ApiBadRequestError('User not found', { userId: id });
    }
    return chapter;
  }
}
