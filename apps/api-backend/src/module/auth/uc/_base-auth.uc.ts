import { AdminUserDetailResponseType } from '@repo/dto';
import type { UserSelectTableRecordType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, PrismaService, UserDao } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

export class BaseAuthUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected userDao: UserDao,
  ) {
    super(prisma, logger);
  }

  protected dbToUserResponse(dbRec: UserSelectTableRecordType): AdminUserDetailResponseType {
    return {
      id: dbRec.id,
      firstname: dbRec.firstname,
      lastname: dbRec.lastname,
      email: dbRec.email,
      isActive: dbRec.isActive,
      roles: [],
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async getUserByIdOrThorw(userId: number): Promise<AdminUserDetailResponseType> {
    const user = await this.userDao.getById({ id: userId });
    if (!user) {
      throw new ApiBadRequestError('User not found');
    }
    return this.dbToUserResponse(user);
  }
}
