import { Injectable } from '@nestjs/common';
import { Prisma, Slide } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
  SlideCreateRequestType,
  SlideDetailResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService, SlideDao, SlideHasThemeDao, ThemeDao, TopicDao } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseSlideUc } from './_base-slide.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: SlideCreateRequestType;
};

@Injectable()
export class SlideCreateUc extends BaseSlideUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    slideDao: SlideDao,
    prisma: PrismaService,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly slideHasThemeDao: SlideHasThemeDao,
    private readonly topicDao: TopicDao,
    private readonly themeDao: ThemeDao,
    private readonly chapterDao: ChapterDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, slideDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating slide', { content: params.dto.content });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const slide = await this.create({ dto: params.dto, tx });
      if (params.dto.themeIds && params.dto.themeIds.length > 0) {
        await this.linkThemesToSlide({ slideId: slide.id, themeIds: params.dto.themeIds, tx });
      }
      return slide.id;
    });
    const slide = await this.getByIdOrThrow(createdId);
    void this.recordActivity(params, slide);
    return { success: true, message: 'Slide created successfully' };
  }

  async validate(params: Params): Promise<void> {
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
  }

  async create(params: { dto: SlideCreateRequestType; tx: Prisma.TransactionClient }): Promise<Slide> {
    return await this.slideDao.create({
      data: {
        content: params.dto.content,
        topic: { connect: { id: params.dto.topicId } },
        chapter: { connect: { id: params.dto.chapterId } },
      },
    });
  }

  async createMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
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

  private async recordActivity(params: Params, createdSlide: SlideDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        content: createdSlide.content,
        chapterId: createdSlide.chapter.id,
        topicId: createdSlide.topic.id,
        themeIds: createdSlide.themes?.map((t) => t.id),
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.slide, entityId: createdSlide.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Slide created',
      data: { changes },
      relatedEntities,
    });
  }
}
