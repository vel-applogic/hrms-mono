import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  FlashcardDetailResponseType,
  FlashcardUpdateRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, FlashcardDao, FlashcardHasThemeDao, IUseCase, PrismaService, TopicDao } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { BaseFlashcardUc } from './_base-flashcard.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: FlashcardUpdateRequestType;
};

@Injectable()
export class FlashcardUpdateUc extends BaseFlashcardUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    flashcardDao: FlashcardDao,
    private readonly flashcardHasThemeDao: FlashcardHasThemeDao,
    private readonly topicDao: TopicDao,
    private readonly chapterDao: ChapterDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, flashcardDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating flashcard', { id: params.id });

    const oldFlashcard = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.update(params.id, params.dto, tx);
      if (params.dto.themeIds !== undefined) {
        await this.linkThemesToFlashcard({ flashcardId: params.id, themeIds: params.dto.themeIds, tx });
      }
    });
    const newFlashcard = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldFlashcard, newFlashcard);

    return { success: true, message: 'Flashcard updated successfully' };
  }

  async validate(params: Params): Promise<FlashcardDetailResponseType> {
    const flashcard = await this.getByIdOrThrow(params.id);

    const topicId = params.dto.topicId ?? flashcard.topicId;
    const chapterId = params.dto.chapterId ?? flashcard.chapterId;

    const topic = await this.topicDao.getById({ id: topicId });
    if (!topic) {
      throw new ApiFieldValidationError('topicId', 'Invalid topic id');
    }

    const chapter = await this.chapterDao.getById({ id: chapterId });
    if (!chapter) {
      throw new ApiFieldValidationError('chapterId', 'Invalid chapter id');
    }

    if (chapterId !== topic.chapterId) {
      throw new ApiFieldValidationError('topicId', 'Topic does not belong to the chapter');
    }

    return flashcard;
  }

  async update(id: number, dto: FlashcardUpdateRequestType, tx: Prisma.TransactionClient): Promise<void> {
    const updateData: Prisma.FlashcardUpdateInput = {
      updatedAt: new Date(),
    };

    if (dto.contentFront !== undefined) {
      updateData.contentFront = dto.contentFront;
    }

    if (dto.contentBack !== undefined) {
      updateData.contentBack = dto.contentBack;
    }

    if (dto.topicId !== undefined) {
      updateData.topic = { connect: { id: dto.topicId } };
    }

    if (dto.chapterId !== undefined) {
      updateData.chapter = { connect: { id: dto.chapterId } };
    }

    await this.flashcardDao.update({ id: id, data: updateData, tx });
  }

  async linkThemesToFlashcard(params: { flashcardId: number; themeIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    await this.flashcardHasThemeDao.deleteManyByFlashcardId({ flashcardId: params.flashcardId, tx: params.tx });

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

  private async recordActivity(params: Params, oldFlashcard: FlashcardDetailResponseType, newFlashcard: FlashcardDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        contentFront: oldFlashcard.contentFront,
        contentBack: oldFlashcard.contentBack,
        topicId: oldFlashcard.topicId,
        chapterId: oldFlashcard.chapterId,
        themeIds: oldFlashcard.themes?.map((t) => t.id),
      },
      newValues: {
        contentFront: newFlashcard.contentFront,
        contentBack: newFlashcard.contentBack,
        topicId: newFlashcard.topicId,
        chapterId: newFlashcard.chapterId,
        themeIds: newFlashcard.themes?.map((t) => t.id),
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.flashcard, entityId: newFlashcard.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Flashcard updated',
      data: { changes },
      relatedEntities,
    });
  }
}
