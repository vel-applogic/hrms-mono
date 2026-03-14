import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
  TopicCreateRequestType,
  TopicDetailResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService, TopicDao } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseTopicUc } from './_base-topic.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: TopicCreateRequestType;
};

@Injectable()
export class TopicCreateUc extends BaseTopicUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    topicDao: TopicDao,
    prisma: PrismaService,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly chapterDao: ChapterDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, topicDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating topic', { title: params.dto.title });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const topic = await this.create({ dto: params.dto, tx });
      if (params.dto.media) {
        const mediaId = await this.createMedia({ input: params.dto.media, relationId: topic.id, tx });
        await this.updateMediaToTopic({ topicId: topic.id, mediaId, tx });
      }
      return topic.id;
    });
    const topic = await this.getByIdOrThrow(createdId);
    void this.recordActivity(params, topic);
    return { success: true, message: 'Topic created successfully' };
  }

  async validate(params: Params): Promise<void> {
    const chapter = await this.chapterDao.getById({ id: params.dto.chapterId });
    if (!chapter) {
      throw new ApiFieldValidationError('chapterId', 'Invalid chapter id');
    }
  }

  async create(params: { dto: TopicCreateRequestType; tx: Prisma.TransactionClient }): Promise<TopicDetailResponseType> {
    const topic = await this.topicDao.create({
      data: {
        title: params.dto.title,
        chapter: { connect: { id: params.dto.chapterId } },
      },
    });

    return {
      id: topic.id,
      title: topic.title,
      chapterId: topic.chapterId ?? undefined,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    };
  }

  async createMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.input,
      mediaPlacement: 'topic',
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

  async updateMediaToTopic(params: { topicId: number; mediaId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.topicDao.update({ id: params.topicId, data: { media: { connect: { id: params.mediaId } } }, tx: params.tx });
  }

  private async recordActivity(params: Params, createdTopic: TopicDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        title: createdTopic.title,
        chapterId: createdTopic.chapterId,
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.topic, entityId: createdTopic.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Topic created',
      data: { changes },
      relatedEntities,
    });
  }
}
