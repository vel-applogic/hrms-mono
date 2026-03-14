import { MediaResponseType, MediaTypeDtoEnum, QuestionDetailResponseType, QuestionListResponseType } from '@repo/dto';
import { QuestionAnswerOptionRecordType, QuestionListRecordType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, PrismaService, QuestionDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BaseQuestionUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly questionDao: QuestionDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<QuestionDetailResponseType | undefined> {
    const question = await this.questionDao.getById({ id });
    if (!question) {
      return undefined;
    }
    let media: MediaResponseType | undefined = undefined;
    if (question.media?.thumbnailKey) {
      const urlFull = await this.s3Service.getSignedUrl(question.media.thumbnailKey);
      media = {
        id: question.media.id,
        name: question.media.name,
        key: question.media.key,
        urlFull: urlFull,
        type: MediaTypeDtoEnum[question.media.type],
        size: question.media.size,
        ext: question.media.ext,
      };
    }
    return {
      id: question.id,
      question: question.question,
      type: question.type,
      answerOptions: (question.answerOptions as QuestionAnswerOptionRecordType).options,
      correctAnswerKeys: question.correctAnswerKeys,
      explanation: question.explanation,
      media: media,
      themes:
        question.questionHasThemes?.map((qht) => ({
          id: qht.theme.id,
          title: qht.theme.title,
          description: qht.theme.description ?? undefined,
          createdAt: qht.theme.createdAt.toISOString(),
          updatedAt: qht.theme.updatedAt.toISOString(),
        })) || [],
      topic: {
        id: question.topic.id,
        title: question.topic.title,
        chapterId: question.topic.chapterId,
        chapterTitle: question.chapter.title,
        createdAt: question.topic.createdAt.toISOString(),
        updatedAt: question.topic.updatedAt.toISOString(),
      },
      chapter: {
        id: question.chapter.id,
        title: question.chapter.title,
        createdAt: question.chapter.createdAt.toISOString(),
        updatedAt: question.chapter.updatedAt.toISOString(),
      },
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
    };
  }

  protected dbToQuestionListResponse(dbRec: QuestionListRecordType): QuestionListResponseType {
    return {
      id: dbRec.id,
      question: dbRec.question,
      type: dbRec.type,
      answerOptions: (dbRec.answerOptions as QuestionAnswerOptionRecordType).options,
      correctAnswerKeys: dbRec.correctAnswerKeys,
      explanation: dbRec.explanation,
      themes:
        dbRec.questionHasThemes?.map((qht) => ({
          id: qht.theme.id,
          title: qht.theme.title,
          description: qht.theme.description ?? undefined,
          createdAt: qht.theme.createdAt.toISOString(),
          updatedAt: qht.theme.updatedAt.toISOString(),
        })) || [],
      topic: {
        id: dbRec.topic.id,
        title: dbRec.topic.title,
        chapterId: dbRec.topic.chapterId,
        chapterTitle: dbRec.chapter.title,
        createdAt: dbRec.topic.createdAt.toISOString(),
        updatedAt: dbRec.topic.updatedAt.toISOString(),
      },
      chapter: {
        id: dbRec.chapter.id,
        title: dbRec.chapter.title,
        createdAt: dbRec.chapter.createdAt.toISOString(),
        updatedAt: dbRec.chapter.updatedAt.toISOString(),
      },
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number): Promise<QuestionDetailResponseType> {
    const question = await this.getById(id);
    if (!question) {
      throw new ApiError('Question not found', 404);
    }
    return question;
  }
}
