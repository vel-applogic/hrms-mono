import { AdminUserDetailResponseType, UserRoleDtoEnum } from '@repo/dto';
import { BaseUc, CommonLoggerService, OrganizationHasUserDao, PrismaService, UserDao, userRoleDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

export class BaseAdminUserUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly userDao: UserDao,
    protected readonly organizationHasUserDao?: OrganizationHasUserDao,
  ) {
    super(prisma, logger);
  }

  async getById(id: number, organizationId: number): Promise<AdminUserDetailResponseType | undefined> {
    const user = await this.userDao.getById({ id });
    if (!user) {
      return undefined;
    }

    const roles = await this.fetchOrgRoles(user.id, organizationId);
    return this.dbToAdminUserDetailResponse(user, roles);
  }

  async getByIdOrThrow(id: number, organizationId: number): Promise<AdminUserDetailResponseType> {
    const user = await this.getById(id, organizationId);
    if (!user) {
      throw new ApiBadRequestError('User not found', { userId: id });
    }
    return user;
  }

  protected async fetchOrgRoles(userId: number, organizationId: number): Promise<UserRoleDtoEnum[]> {
    const orgHasUser = await this.organizationHasUserDao?.findByUserAndOrg({ userId, organizationId });
    return orgHasUser?.roles.map((r) => userRoleDbEnumToDtoEnum(r)) ?? [];
  }
}
