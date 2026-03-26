import type { OrganizationResponseType } from '@repo/dto';
import type { CurrentUserType, OrganizationSelectTableRecordType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, OrganizationDao, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

export class BaseOrganizationUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly organizationDao: OrganizationDao,
  ) {
    super(prisma, logger);
  }

  protected assertSuperAdmin(currentUser: CurrentUserType): void {
    if (!currentUser.isSuperAdmin) {
      throw new ApiBadRequestError('Only super admins can access this resource');
    }
  }

  protected dbToOrganizationResponse(dbRec: OrganizationSelectTableRecordType): OrganizationResponseType {
    return {
      id: dbRec.id,
      name: dbRec.name,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected async getOrganizationResponseById(id: number): Promise<OrganizationResponseType> {
    try {
      const dbRec = await this.organizationDao.getByIdOrThrow({ id });
      return this.dbToOrganizationResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Organization not found');
      }
      throw error;
    }
  }
}
