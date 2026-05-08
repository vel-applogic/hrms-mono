import { AdminUserDetailResponseType, UserRoleDtoEnum } from '@repo/dto';
import { BaseUc, CommonLoggerService, OrganisationHasUserDao, PrismaService, UserDao, userRoleDbEnumToDtoEnum } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

export class BaseAdminUserUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly userDao: UserDao,
    protected readonly organisationHasUserDao?: OrganisationHasUserDao,
  ) {
    super(prisma, logger);
  }

  public async getById(id: number, organisationId: number): Promise<AdminUserDetailResponseType | undefined> {
    const user = await this.userDao.getById({ id });
    if (!user) {
      return undefined;
    }

    const roles = await this.fetchOrgRoles(user.id, organisationId);
    return this.dbToAdminUserDetailResponse(user, roles);
  }

  public async getByIdOrThrow(id: number, organisationId: number): Promise<AdminUserDetailResponseType> {
    const user = await this.getById(id, organisationId);
    if (!user) {
      throw new ApiBadRequestError('User not found', { userId: id });
    }
    return user;
  }

  protected async fetchOrgRoles(userId: number, organisationId: number): Promise<UserRoleDtoEnum[]> {
    const orgHasUser = await this.organisationHasUserDao?.findByUserAndOrg({ userId, organisationId });
    return orgHasUser?.roles.map((r) => userRoleDbEnumToDtoEnum(r)) ?? [];
  }
}
