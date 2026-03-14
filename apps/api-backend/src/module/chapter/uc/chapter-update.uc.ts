import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  ChapterDetailResponseType,
  ChapterUpdateRequestType,
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
  id: number;
  dto: ChapterUpdateRequestType;
};
@Injectable()
export class ChapterUpdateUc extends BaseChapterUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    chapterDao: ChapterDao,
    s3Service: S3Service,
    private readonly mediaService: MediaService,
    private readonly mediaDao: MediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, chapterDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating chapter', { id: params.id });

    const oldChapter = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.update(params.id, params.dto);
      if (params.dto.media) {
        const mediaId = await this.updateMedia({ input: params.dto.media, relationId: params.id, tx });
        await this.updateMediaToChapter({ chapterId: params.id, mediaId, tx });
      }
    });
    const newChapter = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldChapter, newChapter);

    return { success: true, message: 'Chapter updated successfully' };
  }

  async validate(params: Params): Promise<ChapterDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async update(id: number, dto: ChapterUpdateRequestType): Promise<void> {
    const updateData: Prisma.ChapterUpdateInput = {
      updatedAt: new Date(),
      title: dto.title,
      description: dto.description,
      summaryPoints: dto.summaryPoints,
    };
    await this.chapterDao.update({ id: id, data: updateData });
  }

  async updateMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
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

  private async recordActivity(params: Params, oldChapter: ChapterDetailResponseType, newChapter: ChapterDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        title: oldChapter.title,
        description: oldChapter.description,
        summaryPoints: oldChapter.summaryPoints,
      },
      newValues: {
        title: newChapter.title,
        description: newChapter.description,
        summaryPoints: newChapter.summaryPoints,
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.chapter, entityId: newChapter.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Chapter updated',
      data: { changes },
      relatedEntities,
    });
  }
}
