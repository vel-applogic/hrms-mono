import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { MediaService } from '#src/service/media.service.js';

import { TopicController } from './topic.controller.js';
import { TopicCreateUc } from './uc/topic-create.uc.js';
import { TopicDeleteUc } from './uc/topic-delete.uc.js';
import { TopicGetUc } from './uc/topic-get.uc.js';
import { TopicSearchUc } from './uc/topic-search.uc.js';
import { TopicUpdateUc } from './uc/topic-update.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [TopicController],
  providers: [TopicSearchUc, TopicGetUc, TopicCreateUc, TopicUpdateUc, TopicDeleteUc, MediaService],
})
export class TopicModule {}
