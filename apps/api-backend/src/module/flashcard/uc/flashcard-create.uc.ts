import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  FlashcardCreateRequestType,
  FlashcardDetailResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, FlashcardDao, FlashcardHasThemeDao, IUseCase, PrismaService, TopicDao } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseFlashcardUc } from './_base-flashcard.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: FlashcardCreateRequestType;
};

@Injectable()
export class FlashcardCreateUc extends BaseFlashcardUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    flashcardDao: FlashcardDao,
    prisma: PrismaService,
    private readonly flashcardHasThemeDao: FlashcardHasThemeDao,
    private readonly topicDao: TopicDao,
    private readonly chapterDao: ChapterDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, flashcardDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating flashcard', { contentFront: params.dto.contentFront });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const flashcard = await this.create({ dto: params.dto, tx });
      if (params.dto.themeIds && params.dto.themeIds.length > 0) {
        await this.linkThemesToFlashcard({ flashcardId: flashcard.id, themeIds: params.dto.themeIds, tx });
      }
      return flashcard.id;
    });
    const flashcard = await this.getByIdOrThrow(createdId);
    void this.recordActivity(params, flashcard);
    return { success: true, message: 'Flashcard created successfully' };
  }

  async validate(params: Params): Promise<void> {
    const topic = await this.topicDao.getById({ id: params.dto.topicId });
    if (!topic) {
      throw new ApiFieldValidationError('topicId', 'Invalid topic id');
    }

    const chapter = await this.chapterDao.getById({ id: params.dto.chapterId });
    if (!chapter) {
      throw new ApiFieldValidationError('chapterId', 'Invalid chapter id');
    }

    if (params.dto.chapterId !== topic.chapterId) {
      throw new ApiFieldValidationError('topicId', 'Topic does not belong to the chapter');
    }
  }

  async create(params: { dto: FlashcardCreateRequestType; tx: Prisma.TransactionClient }): Promise<FlashcardDetailResponseType> {
    const createData: Prisma.FlashcardCreateInput = {
      contentFront: params.dto.contentFront,
      contentBack: params.dto.contentBack,
      topic: { connect: { id: params.dto.topicId } },
      chapter: { connect: { id: params.dto.chapterId } },
    };

    const flashcard = await this.flashcardDao.create({
      data: createData,
      tx: params.tx,
    });

    return {
      id: flashcard.id,
      contentFront: flashcard.contentFront,
      contentBack: flashcard.contentBack,
      topicId: flashcard.topicId,
      chapterId: flashcard.chapterId,
      themes: [],
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }

  async linkThemesToFlashcard(params: { flashcardId: number; themeIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    for (const themeId of params.themeIds) {
      await this.flashcardHasThemeDao.create({
        data: {
          flashcard: { connect: { id: params.flashcardId } },
          theme: { connect: { id: themeId } },
        },
        tx: params.tx,
      });
    }
  }

  private async recordActivity(params: Params, createdFlashcard: FlashcardDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        contentFront: createdFlashcard.contentFront,
        contentBack: createdFlashcard.contentBack,
        topicId: createdFlashcard.topicId,
        chapterId: createdFlashcard.chapterId,
        themeIds: createdFlashcard.themes?.map((t) => t.id),
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.flashcard, entityId: createdFlashcard.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Flashcard created',
      data: { changes },
      relatedEntities,
    });
  }
}
