import { Injectable } from '@nestjs/common';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  AnnouncementCreateRequestType,
  AnnouncementResponseType,
} from '@repo/dto';
import { AnnouncementDao, AuditService, BranchDao, CommonLoggerService, CurrentUserType, DepartmentDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiBadRequestError } from '@repo/shared';

import { BaseAnnouncementUc } from './_base-announcement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: AnnouncementCreateRequestType;
};

@Injectable()
export class AnnouncementCreateUc extends BaseAnnouncementUc implements IUseCase<Params, AnnouncementResponseType> {
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
    this.logger.i('Creating announcement', { title: params.dto.title });
    await this.validate(params);

    const createdId = await this.transaction(async (tx) => {
      return await this.announcementDao.create({
        data: {
          organization: { connect: { id: params.currentUser.organizationId } },
          title: params.dto.title,
          message: params.dto.message,
          scheduledAt: new Date(params.dto.scheduledAt),
          isPublished: params.dto.isPublished,
          ...(params.dto.branchId ? { branch: { connect: { id: params.dto.branchId } } } : {}),
          ...(params.dto.departmentId ? { department: { connect: { id: params.dto.departmentId } } } : {}),
        },
        tx,
      });
    });

    const response = await this.getAnnouncementResponseById(createdId, params.currentUser.organizationId);
    void this.recordActivity(params, response);
    return response;
  }

  private async validate(params: Params): Promise<void> {
    this.assertAdmin(params.currentUser);

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
  }

  private async recordActivity(params: Params, created: AnnouncementResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        title: created.title,
        scheduledAt: created.scheduledAt,
        isPublished: created.isPublished,
        branch: created.branch?.name,
        department: created.department?.name,
      },
    });

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Announcement created',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.announcement, entityId: created.id }],
    });
  }
}
