import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  ChapterCreateRequestType,
  ChapterDetailResponseType,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseChapterUc } from './_base-chapter.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: ChapterCreateRequestType;
};

@Injectable()
export class ChapterCreateUc extends BaseChapterUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    chapterDao: ChapterDao,
    prisma: PrismaService,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, chapterDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating chapter', { title: params.dto.title });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const chapter = await this.create({ dto: params.dto, tx });
      if (params.dto.media) {
        const mediaId = await this.createMedia({ input: params.dto.media, relationId: chapter.id, tx });
        await this.updateMediaToChapter({ chapterId: chapter.id, mediaId, tx });
      }
      return chapter.id;
    });
    const chapter = await this.getByIdOrThrow(createdId);
    void this.recordActivity(params, chapter);
    return { success: true, message: 'Chapter created successfully' };
  }

  async validate(params: Params): Promise<void> {}

  async create(params: { dto: ChapterCreateRequestType; tx: Prisma.TransactionClient }): Promise<ChapterDetailResponseType> {
    const chapter = await this.chapterDao.create({
      data: {
        title: params.dto.title,
        description: params.dto.description,
        summaryPoints: params.dto.summaryPoints || [],
      },
      tx: params.tx,
    });

    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description || undefined,
      summaryPoints: chapter.summaryPoints,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
    };
  }

  async createMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.input,
      mediaPlacement: 'chapter',
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

  async updateMediaToChapter(params: { chapterId: number; mediaId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.chapterDao.update({ id: params.chapterId, data: { media: { connect: { id: params.mediaId } } }, tx: params.tx });
  }

  private async recordActivity(params: Params, createdChapter: ChapterDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        title: createdChapter.title,
        description: createdChapter.description,
        summaryPoints: createdChapter.summaryPoints,
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.chapter, entityId: createdChapter.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Project created',
      data: { changes },
      relatedEntities,
    });
  }
}
