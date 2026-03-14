import { Module } from '@nestjs/common';

import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { MediaService } from '#src/service/media.service.js';

import { SlideController } from './slide.controller.js';
import { SlideCreateUc } from './uc/slide-create.uc.js';
import { SlideDeleteUc } from './uc/slide-delete.uc.js';
import { SlideGetUc } from './uc/slide-get.uc.js';
import { SlideSearchUc } from './uc/slide-search.uc.js';
import { SlideUpdateUc } from './uc/slide-update.uc.js';

@Module({
  imports: [ExternalServiceModule],
  controllers: [SlideController],
  providers: [SlideSearchUc, SlideGetUc, SlideCreateUc, SlideUpdateUc, SlideDeleteUc, MediaService],
})
export class SlideModule {}
