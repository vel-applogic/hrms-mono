import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, OperationStatusResponseType, SlideDetailResponseType } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, SlideDao, SlideHasThemeDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseSlideUc } from './_base-slide.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class SlideDeleteUc extends BaseSlideUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    slideDao: SlideDao,
    s3Service: S3Service,
    private readonly slideHasThemeDao: SlideHasThemeDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, slideDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting slide', { id: params.id });

    const slide = await this.validate(params);

    this.transaction(async (tx) => {
      await this.removeThemes({ slideId: params.id, tx });
      await this.delete({ id: params.id, tx });
    });
    void this.recordActivity(params, slide);

    return { success: true, message: 'Slide deleted successfully' };
  }

  async validate(params: Params): Promise<SlideDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async removeThemes(params: { slideId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.slideHasThemeDao.deleteManyBySlideId({ slideId: params.slideId, tx: params.tx });
  }

  async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.slideDao.delete({ id: params.id, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedSlide: SlideDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.slide, entityId: deletedSlide.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Slide ${deletedSlide.id} deleted`,
      relatedEntities,
    });
  }
}
