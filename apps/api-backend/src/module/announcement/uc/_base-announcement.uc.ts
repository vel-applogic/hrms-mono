import type { AnnouncementDetailResponseType, AnnouncementResponseType } from '@repo/dto';
import { AnnouncementDao, AnnouncementDetailRecordType, AnnouncementListRecordType, BaseUc, CommonLoggerService, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError, DbRecordNotFoundError } from '@repo/shared';

export class BaseAnnouncementUc extends BaseUc {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly announcementDao: AnnouncementDao,
  ) {
    super(prisma, logger);
  }

  protected dbToAnnouncementResponse(dbRec: AnnouncementListRecordType): AnnouncementResponseType {
    return {
      id: dbRec.id,
      title: dbRec.title,
      message: dbRec.message,
      branchId: dbRec.branchId ?? undefined,
      departmentId: dbRec.departmentId ?? undefined,
      scheduledAt: dbRec.scheduledAt.toISOString(),
      isPublished: dbRec.isPublished,
      isNotificationSent: dbRec.isNotificationSent,
      branch: dbRec.branch,
      department: dbRec.department,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  protected dbToAnnouncementDetailResponse(dbRec: AnnouncementDetailRecordType): AnnouncementDetailResponseType {
    return {
      ...this.dbToAnnouncementResponse(dbRec),
    };
  }

  protected async getAnnouncementById(id: number, organizationId: number): Promise<AnnouncementDetailResponseType> {
    try {
      const dbRec = await this.announcementDao.getByIdOrThrow({ id, organizationId });
      return this.dbToAnnouncementDetailResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Announcement not found');
      }
      throw error;
    }
  }

  protected async getAnnouncementResponseById(id: number, organizationId: number): Promise<AnnouncementResponseType> {
    try {
      const dbRec = await this.announcementDao.getByIdOrThrow({ id, organizationId });
      return this.dbToAnnouncementResponse(dbRec);
    } catch (error) {
      if (error instanceof DbRecordNotFoundError) {
        throw new ApiBadRequestError('Announcement not found');
      }
      throw error;
    }
  }
}
