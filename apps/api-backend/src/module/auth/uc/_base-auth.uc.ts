import { User } from '@repo/db';
import { AdminUserDetailResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, planDbEnumToDtoEnum, PrismaService, UserDao, userRoleDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

export class BaseAuthUseCase extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected userDao: UserDao,
  ) {
    super(prisma, logger);
  }

  protected dbToUserResponse(dbRec: User): AdminUserDetailResponseType {
    return {
      id: dbRec.id,
      firstname: dbRec.firstname,
      lastname: dbRec.lastname,
      email: dbRec.email,
      role: userRoleDbEnumToDtoEnum(dbRec.role),
      plan: planDbEnumToDtoEnum(dbRec.plan),
      isActive: dbRec.isActive,
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
