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
  TopicDetailResponseType,
  TopicUpdateRequestType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService, TopicDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseTopicUc } from './_base-topic.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: TopicUpdateRequestType;
};

@Injectable()
export class TopicUpdateUc extends BaseTopicUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    topicDao: TopicDao,
    s3Service: S3Service,
    private readonly mediaService: MediaService,
    private readonly mediaDao: MediaDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, topicDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating topic', { id: params.id });

    const oldTopic = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.update(params.id, params.dto);
      if (params.dto.media) {
        const mediaId = await this.updateMedia({ input: params.dto.media, relationId: params.id, tx });
        await this.updateMediaToTopic({ topicId: params.id, mediaId, tx });
      }
    });
    const newTopic = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldTopic, newTopic);

    return { success: true, message: 'Topic updated successfully' };
  }

  async validate(params: Params): Promise<TopicDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async update(id: number, dto: TopicUpdateRequestType): Promise<void> {
    const updateData: Prisma.TopicUpdateInput = {
      updatedAt: new Date(),
      title: dto.title,
      chapter: { connect: { id: dto.chapterId } },
    };
    await this.topicDao.update({ id: id, data: updateData });
  }

  async updateMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
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

  private async recordActivity(params: Params, oldTopic: TopicDetailResponseType, newTopic: TopicDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        title: oldTopic.title,
        chapterId: oldTopic.chapterId,
      },
      newValues: {
        title: newTopic.title,
        chapterId: newTopic.chapterId,
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.topic, entityId: newTopic.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Topic updated',
      data: { changes },
      relatedEntities,
    });
  }
}
