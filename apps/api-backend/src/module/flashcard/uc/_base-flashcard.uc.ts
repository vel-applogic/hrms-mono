import { FlashcardDetailResponseType, FlashcardListResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, FlashcardDao, FlashcardListRecordType, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

export class BaseFlashcardUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly flashcardDao: FlashcardDao,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<FlashcardDetailResponseType | undefined> {
    const flashcard = await this.flashcardDao.getById({ id });
    if (!flashcard) {
      return undefined;
    }
    return {
      id: flashcard.id,
      contentFront: flashcard.contentFront,
      contentBack: flashcard.contentBack,
      topicId: flashcard.topicId,
      chapterId: flashcard.chapterId,
      themes:
        flashcard.flashcardHasThemes?.map((fht) => ({
          id: fht.theme.id,
          title: fht.theme.title,
          description: fht.theme.description ?? undefined,
          createdAt: fht.theme.createdAt.toISOString(),
          updatedAt: fht.theme.updatedAt.toISOString(),
        })) || [],
      createdAt: flashcard.createdAt.toISOString(),
      updatedAt: flashcard.updatedAt.toISOString(),
    };
  }

  protected dbToFlashcardListResponse(dbRec: FlashcardListRecordType): FlashcardListResponseType {
    return {
      id: dbRec.id,
      contentFront: dbRec.contentFront,
      contentBack: dbRec.contentBack,
      topicId: dbRec.topicId,
      chapterId: dbRec.chapterId,
      topic: {
        id: dbRec.topic.id,
        title: dbRec.topic.title,
      },
      chapter: {
        id: dbRec.chapter.id,
        title: dbRec.chapter.title,
        description: dbRec.chapter.description ?? undefined,
        summaryPoints: dbRec.chapter.summaryPoints,
        createdAt: dbRec.chapter.createdAt.toISOString(),
        updatedAt: dbRec.chapter.updatedAt.toISOString(),
      },
      themes: dbRec.flashcardHasThemes.map((fht) => ({
        id: fht.theme.id,
        title: fht.theme.title,
        description: fht.theme.description ?? undefined,
        createdAt: fht.theme.createdAt.toISOString(),
        updatedAt: fht.theme.updatedAt.toISOString(),
      })),
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number): Promise<FlashcardDetailResponseType> {
    const flashcard = await this.getById(id);
    if (!flashcard) {
      throw new ApiError('Flashcard not found', 404);
    }
    return flashcard;
  }
}
