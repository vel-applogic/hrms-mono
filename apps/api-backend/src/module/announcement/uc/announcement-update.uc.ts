import { Injectable } from '@nestjs/common';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  AnnouncementResponseType,
  AnnouncementUpdateRequestType,
} from '@repo/dto';
import { AnnouncementDao, AuditService, BranchDao, CommonLoggerService, CurrentUserType, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { BaseAnnouncementUc } from './_base-announcement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: AnnouncementUpdateRequestType;
};

@Injectable()
export class AnnouncementUpdateUc extends BaseAnnouncementUc implements IUseCase<Params, AnnouncementResponseType> {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    announcementDao: AnnouncementDao,
    private readonly branchDao: BranchDao,
    private readonly departmentDao: DepartmentDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, announcementDao);
  }

  public async execute(params: Params): Promise<AnnouncementResponseType> {
    this.logger.i('Updating announcement', { id: params.dto.id });
    const oldAnnouncement = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.announcementDao.update({
        id: params.dto.id,
        organizationId: params.currentUser.organizationId,
        data: {
          title: params.dto.title,
          message: params.dto.message,
          scheduledAt: new Date(params.dto.scheduledAt),
          isPublished: params.dto.isPublished,
          branch: params.dto.branchId ? { connect: { id: params.dto.branchId } } : { disconnect: true },
          department: params.dto.departmentId ? { connect: { id: params.dto.departmentId } } : { disconnect: true },
        },
        tx,
      });
    });

    const updatedAnnouncement = await this.getAnnouncementResponseById(params.dto.id, params.currentUser.organizationId);
    void this.recordActivity(params, oldAnnouncement, updatedAnnouncement);
    return updatedAnnouncement;
  }

  private async validate(params: Params): Promise<AnnouncementResponseType> {
    this.assertAdmin(params.currentUser);

    const existing = await this.announcementDao.getById({ id: params.dto.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiBadRequestError('Announcement not found');
    }

    if (params.dto.branchId) {
      const branch = await this.branchDao.findById({ id: params.dto.branchId });
      if (!branch || branch.organizationId !== params.currentUser.organizationId) {
        throw new ApiBadRequestError('Branch not found');
      }
    }

    if (params.dto.departmentId) {
      const department = await this.departmentDao.findById({ id: params.dto.departmentId });
      if (!department || department.organizationId !== params.currentUser.organizationId) {
        throw new ApiBadRequestError('Department not found');
      }
    }

    return this.dbToAnnouncementResponse(existing);
  }

  private async recordActivity(params: Params, oldAnnouncement: AnnouncementResponseType, newAnnouncement: AnnouncementResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        title: oldAnnouncement.title,
        scheduledAt: oldAnnouncement.scheduledAt,
        isPublished: oldAnnouncement.isPublished,
        branch: oldAnnouncement.branch?.name ?? null,
        department: oldAnnouncement.department?.name ?? null,
      },
      newValues: {
        title: newAnnouncement.title,
        scheduledAt: newAnnouncement.scheduledAt,
        isPublished: newAnnouncement.isPublished,
        branch: newAnnouncement.branch?.name ?? null,
        department: newAnnouncement.department?.name ?? null,
      },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Announcement updated',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.announcement, entityId: newAnnouncement.id }],
    });
  }
}
