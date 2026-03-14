import { Topic } from "@repo/db";
import { MediaResponseType, MediaTypeDtoEnum, TopicDetailResponseType, TopicListResponseType } from "@repo/dto";
import { BaseUc, CommonLoggerService, PrismaService, TopicDao, TopicListRecordType } from "@repo/nest-lib";
import { ApiError } from "@repo/shared";

import { S3Service } from "#src/external-service/s3.service.js";

export class BaseTopicUc extends BaseUc {

  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly topicDao: TopicDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  async getById(id: number): Promise<TopicDetailResponseType | undefined> {
    const topic = await this.topicDao.getById({ id });
    if (!topic) {
      return undefined;
    }
    let media: MediaResponseType | undefined = undefined;
    if (topic.media?.thumbnailKey) {
      const urlFull = await this.s3Service.getSignedUrl(topic.media.thumbnailKey);
       media = {
        id: topic.media.id,
        name: topic.media.name,
        key: topic.media.key,
        urlFull: urlFull,
        type: MediaTypeDtoEnum[topic.media.type],
        size: topic.media.size,
        ext: topic.media.ext,
      };
      
    }
    return {
      id: topic.id,
      title: topic.title,
      chapterId: topic.chapterId ?? undefined,
      media: media,
      createdAt: topic.createdAt.toISOString(),
      updatedAt: topic.updatedAt.toISOString(),
    };
  }

  protected dbToTopicListResponse(dbRec: TopicListRecordType): TopicListResponseType {
    return {
      id: dbRec.id,
      title: dbRec.title,
      chapterId: dbRec.chapterId ?? undefined,
      chapterTitle: dbRec.chapter.title,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }

  async getByIdOrThrow(id: number): Promise<TopicDetailResponseType> {
    const topic = await this.getById(id);
    if (!topic) {
      throw new ApiError('Topic not found', 404);
    }
    return topic;
  }
}
