import { Injectable } from '@nestjs/common';
import { Prisma, Question } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
  QuestionCreateRequestType,
  QuestionDetailResponseType,
} from '@repo/dto';
import { AuditService, ChapterDao, CommonLoggerService, CurrentUserType, IUseCase, MediaDao, PrismaService, QuestionDao, QuestionHasThemeDao, ThemeDao, TopicDao } from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseQuestionUc } from './_base-question.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: QuestionCreateRequestType;
};

@Injectable()
export class QuestionCreateUc extends BaseQuestionUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    questionDao: QuestionDao,
    prisma: PrismaService,
    s3Service: S3Service,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly questionHasThemeDao: QuestionHasThemeDao,
    private readonly themeDao: ThemeDao,
    private readonly topicDao: TopicDao,
    private readonly chapterDao: ChapterDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, questionDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating question', { question: params.dto.question });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const question = await this.create({ dto: params.dto, tx });
      if (params.dto.media) {
        const mediaId = await this.createMedia({ input: params.dto.media, relationId: question.id, tx });
        await this.updateMediaToQuestion({ questionId: question.id, mediaId, tx });
      }
      if (params.dto.themeIds && params.dto.themeIds.length > 0) {
        await this.linkThemesToQuestion({ questionId: question.id, themeIds: params.dto.themeIds, tx });
      }
      return question.id;
    });
    const question = await this.getByIdOrThrow(createdId);
    void this.recordActivity(params, question);
    return { success: true, message: 'Question created successfully' };
  }

  async validate(params: Params): Promise<void> {
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
  }

  async create(params: { dto: QuestionCreateRequestType; tx: Prisma.TransactionClient }): Promise<Question> {
    return await this.questionDao.create({
      data: {
        question: params.dto.question,
        type: params.dto.type,
        answerOptions: { options: params.dto.answerOptions },
        correctAnswerKeys: params.dto.correctAnswerKeys,
        explanation: params.dto.explanation,
        topic: { connect: { id: params.dto.topicId } },
        chapter: { connect: { id: params.dto.chapterId } },
      },
      tx: params.tx,
    });
  }

  async createMedia(params: { input: MediaUpsertType; relationId: number; tx: Prisma.TransactionClient }): Promise<number> {
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

  private async recordActivity(params: Params, createdQuestion: QuestionDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        question: createdQuestion.question,
        type: createdQuestion.type,
        answerOptions: createdQuestion.answerOptions,
        correctAnswerKeys: createdQuestion.correctAnswerKeys,
        explanation: createdQuestion.explanation,
        chapterId: createdQuestion.chapter.id,
        topicId: createdQuestion.topic.id,
        themeIds: createdQuestion.themes?.map((t) => t.id),
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.question, entityId: createdQuestion.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Question created',
      data: { changes },
      relatedEntities,
    });
  }
}
