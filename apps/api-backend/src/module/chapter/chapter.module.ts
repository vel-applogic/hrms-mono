import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { MediaService } from '#src/service/media.service.js';

import { ChapterController } from './chapter.controller.js';
import { ChapterCreateUc } from './uc/chapter-create.uc.js';
import { ChapterDeleteUc } from './uc/chapter-delete.uc.js';
import { ChapterGetUc } from './uc/chapter-get.uc.js';
import { ChapterSearchUc } from './uc/chapter-search.uc.js';
import { ChapterUpdateUc } from './uc/chapter-update.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [ChapterController],
  providers: [ChapterSearchUc, ChapterGetUc, ChapterCreateUc, ChapterUpdateUc, ChapterDeleteUc, MediaService],
})
export class ChapterModule {}
