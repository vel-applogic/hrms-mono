import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  ChapterDetailResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, FlashcardDao, IUseCase, PrismaService, QuestionDao, SlideDao, TopicDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseChapterUc } from './_base-chapter.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ChapterDeleteUc extends BaseChapterUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    chapterDao: ChapterDao,
    s3Service: S3Service,
    private readonly topicDao: TopicDao,
    private readonly slideDao: SlideDao,
    private readonly questionDao: QuestionDao,
    private readonly flashcardDao: FlashcardDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, chapterDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting chapter', { id: params.id });

    const chapter = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.delete({ id: params.id, tx });
    });
    void this.recordActivity(params, chapter);

    return { success: true, message: 'Chapter deleted successfully' };
  }

  async validate(params: Params): Promise<ChapterDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    // delete all topics, slides, questions, and flashcards related to the chapter
    await this.topicDao.deleteManyByChapterId({ chapterId: params.id, tx: params.tx });
    await this.slideDao.deleteManyByChapterId({ chapterId: params.id, tx: params.tx });
    await this.questionDao.deleteManyByChapterId({ chapterId: params.id, tx: params.tx });
    await this.flashcardDao.deleteManyByChapterId({ chapterId: params.id, tx: params.tx });
    // delete the chapter
    await this.chapterDao.delete({ id: params.id, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedChapter: ChapterDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.chapter, entityId: deletedChapter.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Chapter ${deletedChapter.title} deleted`,
      relatedEntities,
    });
  }
}
