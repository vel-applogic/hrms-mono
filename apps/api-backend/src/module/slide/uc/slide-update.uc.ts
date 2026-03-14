import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
  SlideDetailResponseType,
  SlideUpdateRequestType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService, SlideDao, SlideHasThemeDao, ThemeDao, TopicDao } from '@repo/nest-lib';
import { ApiError, ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseSlideUc } from './_base-slide.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: SlideUpdateRequestType;
};

@Injectable()
export class SlideUpdateUc extends BaseSlideUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    slideDao: SlideDao,
    s3Service: S3Service,
    private readonly mediaService: MediaService,
    private readonly mediaDao: MediaDao,
    private readonly slideHasThemeDao: SlideHasThemeDao,
    private readonly themeDao: ThemeDao,
    private readonly chapterDao: ChapterDao,
    private readonly topicDao: TopicDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, slideDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating slide', { id: params.id });

    const oldSlide = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.update(params.id, params.dto);
      // if (params.dto.media) {
      //   const mediaId = await this.updateMedia({ input: params.dto.media, relationId: params.id, tx });
      //   await this.updateMediaToSlide({ slideId: params.id, mediaId, tx });
      // }
      if (params.dto.themeIds !== undefined) {
        await this.linkThemesToSlide({ slideId: params.id, themeIds: params.dto.themeIds, tx });
      }
    });
    const newSlide = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldSlide, newSlide);

    return { success: true, message: 'Slide updated successfully' };
  }

  async validate(params: Params): Promise<SlideDetailResponseType> {
    const existing = await this.slideDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Slide not found', 404);
    }

    if (params.dto.themeIds && params.dto.themeIds.length > 0) {
      for (const themeId of params.dto.themeIds) {
        const theme = await this.themeDao.getById({ id: themeId });
        if (!theme) {
          throw new ApiFieldValidationError(`themeIds.${themeId}`, 'Invalid theme id');
        }
      }
    }

    const chapter = await this.chapterDao.getById({ id: params.dto.chapterId });
    if (!chapter) {
      throw new ApiFieldValidationError('chapterId', 'Invalid chapter id');
    }

    const topic = await this.topicDao.getById({ id: params.dto.topicId });
    if (!topic) {
      throw new ApiFieldValidationError('topicId', 'Invalid topic id');
    }
    if (topic.chapterId !== params.dto.chapterId) {
      throw new ApiFieldValidationError('topicId', 'Topic is not part of chapter');
    }

    return await this.getByIdOrThrow(params.id);
  }

  async update(id: number, dto: SlideUpdateRequestType): Promise<void> {
    const updateData: Prisma.SlideUpdateInput = {
      updatedAt: new Date(),
      content: dto.content,
      topic: { connect: { id: dto.topicId } },
      chapter: { connect: { id: dto.chapterId } },
    };
    await this.slideDao.update({ id: id, data: updateData });
  }

  async updateMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.input,
      mediaPlacement: 'slide',
      relationId: params.relationId,
      isImage: params.input.type === MediaTypeDtoEnum.image,
    });

    return await this.mediaDao.create({
      data: {
        key: file!.newKey,
        name: params.input.name,
        type: params.input.type,
        size: file!.size,
        ext: file!.ext,
      },
      tx: params.tx,
    });
  }

  async linkThemesToSlide(params: { slideId: number; themeIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    await this.slideHasThemeDao.deleteManyBySlideId({ slideId: params.slideId, tx: params.tx });

    for (const themeId of params.themeIds) {
      await this.slideHasThemeDao.create({
        data: {
          slide: { connect: { id: params.slideId } },
          theme: { connect: { id: themeId } },
        },
        tx: params.tx,
      });
    }
  }

  private async recordActivity(params: Params, oldSlide: SlideDetailResponseType, newSlide: SlideDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        content: oldSlide.content,
        chapterId: oldSlide.chapter.id,
        topicId: oldSlide.topic.id,
        themeIds: oldSlide.themes?.map((t) => t.id),
      },
      newValues: {
        content: newSlide.content,
        chapterId: newSlide.chapter.id,
        topicId: newSlide.topic.id,
        themeIds: newSlide.themes?.map((t) => t.id),
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.slide, entityId: newSlide.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Slide updated',
      data: { changes },
      relatedEntities,
    });
  }
}
