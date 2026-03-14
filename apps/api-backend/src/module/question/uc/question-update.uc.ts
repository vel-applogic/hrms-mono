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
  QuestionDetailResponseType,
  QuestionUpdateRequestType,
} from '@repo/dto';
import {
  AuditService,
  ChapterDao,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  MediaDao,
  PrismaService,
  QuestionDao,
  QuestionHasThemeDao,
  ThemeDao,
  TopicDao,
} from '@repo/nest-lib';
import { ApiError, ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseQuestionUc } from './_base-question.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: QuestionUpdateRequestType;
};

@Injectable()
export class QuestionUpdateUc extends BaseQuestionUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    questionDao: QuestionDao,
    s3Service: S3Service,
    private readonly mediaService: MediaService,
    private readonly mediaDao: MediaDao,
    private readonly questionHasThemeDao: QuestionHasThemeDao,
    private readonly themeDao: ThemeDao,
    private readonly topicDao: TopicDao,
    private readonly chapterDao: ChapterDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, questionDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating question', { id: params.id });

    const oldQuestion = await this.validate(params);
    await this.transaction(async (tx) => {
      await this.update({ id: params.id, dto: params.dto });
      if (params.dto.media) {
        const mediaId = await this.updateMedia({ input: params.dto.media, relationId: params.id, tx });
        await this.updateMediaToQuestion({ questionId: params.id, mediaId, tx });
      }
      if (params.dto.themeIds !== undefined) {
        await this.linkThemesToQuestion({ questionId: params.id, themeIds: params.dto.themeIds, tx });
      }
    });
    const newQuestion = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldQuestion, newQuestion);

    return { success: true, message: 'Question updated successfully' };
  }

  async validate(params: Params): Promise<QuestionDetailResponseType> {
    const existing = await this.questionDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Question not found', 404);
    }

    const optionKeys = params.dto.answerOptions.map((option) => option.key);
    const uniqueOptionKeys = [...new Set(optionKeys)];
    if (optionKeys.length !== uniqueOptionKeys.length) {
      throw new ApiFieldValidationError('answerOptions', 'Option keys must be unique');
    }

    for (const key of params.dto.correctAnswerKeys) {
      if (!params.dto.answerOptions.some((option) => option.key === key)) {
        throw new ApiFieldValidationError('correctAnswerKeys', `Key ${key} is not a valid answer option`);
      }
    }

    if (params.dto.correctAnswerKeys.length === 0) {
      throw new ApiFieldValidationError('correctAnswerKeys', 'At least one correct answer key is required');
    }

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

    if (params.dto.themeIds && params.dto.themeIds.length > 0) {
      for (const themeId of params.dto.themeIds) {
        const theme = await this.themeDao.getById({ id: themeId });
        if (!theme) {
          throw new ApiFieldValidationError(`themeIds.${themeId}`, 'Invalid theme id');
        }
      }
    }

    return await this.getByIdOrThrow(params.id);
  }

  async update(params: { id: number; dto: QuestionUpdateRequestType }): Promise<void> {
    const updateData: Prisma.QuestionUpdateInput = {
      updatedAt: new Date(),
      question: params.dto.question,
      type: params.dto.type,
      answerOptions: params.dto.answerOptions,
      correctAnswerKeys: params.dto.correctAnswerKeys,
      explanation: params.dto.explanation,
      topic: { connect: { id: params.dto.topicId } },
      chapter: { connect: { id: params.dto.chapterId } },
    };
    await this.questionDao.update({ id: params.id, data: updateData });
  }

  async updateMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.input,
      mediaPlacement: 'question',
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

  async updateMediaToQuestion(params: { questionId: number; mediaId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.questionDao.update({ id: params.questionId, data: { media: { connect: { id: params.mediaId } } }, tx: params.tx });
  }

  async linkThemesToQuestion(params: { questionId: number; themeIds: number[]; tx: Prisma.TransactionClient }): Promise<void> {
    await this.questionHasThemeDao.deleteManyByQuestionId({ questionId: params.questionId, tx: params.tx });

    for (const themeId of params.themeIds) {
      await this.questionHasThemeDao.create({
        data: {
          question: { connect: { id: params.questionId } },
          theme: { connect: { id: themeId } },
        },
        tx: params.tx,
      });
    }
  }

  private async recordActivity(params: Params, oldQuestion: QuestionDetailResponseType, newQuestion: QuestionDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        question: oldQuestion.question,
        type: oldQuestion.type,
        answerOptions: oldQuestion.answerOptions,
        correctAnswerKeys: oldQuestion.correctAnswerKeys,
        explanation: oldQuestion.explanation,
        chapterId: oldQuestion.chapter.id,
        topicId: oldQuestion.topic.id,
        themeIds: oldQuestion.themes?.map((t) => t.id),
      },
      newValues: {
        question: newQuestion.question,
        type: newQuestion.type,
        answerOptions: newQuestion.answerOptions,
        correctAnswerKeys: newQuestion.correctAnswerKeys,
        explanation: newQuestion.explanation,
        chapterId: newQuestion.chapter.id,
        topicId: newQuestion.topic.id,
        themeIds: newQuestion.themes?.map((t) => t.id),
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.question, entityId: newQuestion.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Question updated',
      data: { changes },
      relatedEntities,
    });
  }
}
