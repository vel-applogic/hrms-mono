import { MediaResponseType, SlideDetailResponseType, SlideListResponseType } from '@repo/dto';
import { SlideListRecordType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, PrismaService, SlideDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

export class BaseSlideUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly slideDao: SlideDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<SlideDetailResponseType | undefined> {
    const slide = await this.slideDao.getById({ id });
    if (!slide) {
      return undefined;
    }

    // FIXME: fix media
    // const media: MediaResponseType | undefined = undefined;
    // if (slide.media?.thumbnailKey) {
    //   const urlFull = await this.s3Service.getSignedUrl(slide.media.thumbnailKey);
    //   media = {
    //     id: slide.media.id,
    //     name: slide.media.name,
    //     key: slide.media.key,
    //     urlFull: urlFull,
    //     type: MediaTypeDtoEnum[slide.media.type],
    //     size: slide.media.size,
    //     ext: slide.media.ext,
    //   };
    // }
    return {
      id: slide.id,
      content: JSON.stringify(slide.content),
      topic: {
        id: slide.topic.id,
        title: slide.topic.title,
        chapterId: slide.topic.chapterId,
        chapterTitle: slide.chapter.title,
        createdAt: slide.topic.createdAt.toISOString(),
        updatedAt: slide.topic.updatedAt.toISOString(),
      },
      chapter: {
        id: slide.chapter.id,
        title: slide.chapter.title,
        createdAt: slide.chapter.createdAt.toISOString(),
        updatedAt: slide.chapter.updatedAt.toISOString(),
      },
      themes:
        slide.slideHasThemes?.map((sht) => ({
          id: sht.theme.id,
          title: sht.theme.title,
          description: sht.theme.description ?? undefined,
          createdAt: sht.theme.createdAt.toISOString(),
          updatedAt: sht.theme.updatedAt.toISOString(),
        })) || [],
      createdAt: slide.createdAt.toISOString(),
      updatedAt: slide.updatedAt.toISOString(),
    };
  }

  protected dbToSlideListResponse(dbRec: SlideListRecordType): SlideListResponseType {
    return {
      id: dbRec.id,
      // content: dbRec.content, // FIXME: fix content
      topicId: dbRec.topicId,
      chapterId: dbRec.chapterId,
      topic: {
        id: dbRec.topic.id,
        title: dbRec.topic.title,
      },
      chapter: {
        id: dbRec.chapter.id,
        title: dbRec.chapter.title,
      },
      themes:
        dbRec.slideHasThemes?.map((sht) => ({
          id: sht.theme.id,
          title: sht.theme.title,
        })) || [],
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number): Promise<SlideDetailResponseType> {
    const slide = await this.getById(id);
    if (!slide) {
      throw new ApiError('Slide not found', 404);
    }
    return slide;
  }
}
