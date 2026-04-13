import { Injectable } from '@nestjs/common';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  AnnouncementResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AnnouncementDao, AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseAnnouncementUc } from './_base-announcement.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class AnnouncementDeleteUc extends BaseAnnouncementUc implements IUseCase<Params, OperationStatusResponseType> {
  public constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    announcementDao: AnnouncementDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, announcementDao);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting announcement', { id: params.id });
    const announcement = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.announcementDao.deleteByIdOrThrow({
        id: params.id,
        organizationId: params.currentUser.organizationId,
        tx,
      });
    });

    void this.recordActivity(params, announcement);
    return { success: true, message: 'Announcement deleted successfully' };
  }

  private async validate(params: Params): Promise<AnnouncementResponseType> {
    this.assertAdmin(params.currentUser);
    return await this.getAnnouncementResponseById(params.id, params.currentUser.organizationId);
  }

  private async recordActivity(params: Params, deleted: AnnouncementResponseType): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Announcement ${deleted.id} deleted`,
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.announcement, entityId: deleted.id }],
    });
  }
}
