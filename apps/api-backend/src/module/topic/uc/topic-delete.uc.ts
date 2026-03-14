import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, OperationStatusResponseType, TopicDetailResponseType } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, FlashcardDao, IUseCase, PrismaService, QuestionDao, SlideDao, TopicDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseTopicUc } from './_base-topic.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class TopicDeleteUc extends BaseTopicUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    topicDao: TopicDao,
    s3Service: S3Service,
    private readonly slideDao: SlideDao,
    private readonly questionDao: QuestionDao,
    private readonly flashcardDao: FlashcardDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, topicDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting topic', { id: params.id });

    const topic = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.delete({ id: params.id, tx });
    });

    void this.recordActivity(params, topic);

    return { success: true, message: 'Topic deleted successfully' };
  }

  async validate(params: Params): Promise<TopicDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    // delete all related slides, questions, and flashcards
    await this.slideDao.deleteManyByTopicId({ topicId: params.id, tx: params.tx });
    await this.questionDao.deleteManyByTopicId({ topicId: params.id, tx: params.tx });
    await this.flashcardDao.deleteManyByTopicId({ topicId: params.id, tx: params.tx });
    await this.topicDao.delete({ id: params.id, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedTopic: TopicDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.topic, entityId: deletedTopic.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Topic ${deletedTopic.title} deleted`,
      relatedEntities,
    });
  }
}
