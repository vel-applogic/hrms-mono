import { Chapter } from "@repo/db";
import { ChapterDetailResponseType, ChapterListResponseType, MediaResponseType, MediaTypeDtoEnum } from "@repo/dto";
import { BaseUc, ChapterDao, CommonLoggerService, PrismaService } from "@repo/nest-lib";
import { ApiError } from "@repo/shared";

import { S3Service } from "#src/external-service/s3.service.js";

export class BaseChapterUc extends BaseUc {

  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly chapterDao: ChapterDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<ChapterDetailResponseType | undefined> {
    const chapter = await this.chapterDao.getById({ id });
    if (!chapter) {
      return undefined;
    }
    let media: MediaResponseType | undefined = undefined;
    if (chapter.media?.thumbnailKey) {
      const urlFull = await this.s3Service.getSignedUrl(chapter.media.thumbnailKey);
       media = {
        id: chapter.media.id,
        name: chapter.media.name,
        key: chapter.media.key,
        urlFull: urlFull,
        type: MediaTypeDtoEnum[chapter.media.type],
        size: chapter.media.size,
        ext: chapter.media.ext,
      };
      
    }
    return {
      id: chapter.id,
      title: chapter.title,
      description: chapter.description ?? undefined,
      media: media,
      summaryPoints: chapter.summaryPoints,
      createdAt: chapter.createdAt.toISOString(),
      updatedAt: chapter.updatedAt.toISOString(),
    };
  }

  protected dbToChapterListResponse(dbRec: Chapter): ChapterListResponseType {
    return {
      id: dbRec.id,
      title: dbRec.title,
      description: dbRec.description ?? undefined,
      summaryPoints: dbRec.summaryPoints,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number): Promise<ChapterDetailResponseType> {
    const chapter = await this.getById(id);
    if (!chapter) {
      throw new ApiError('Chapter not found', 404);
    }
    return chapter;
  }
}