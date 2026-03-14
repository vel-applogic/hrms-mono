import { Module } from '@nestjs/common';
import { CommonDbModule, CommonLoggerService } from '@repo/nest-lib';

import { AppConfigModule } from '#src/config/app-config.module.js';
import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { ServiceModule } from '#src/service/service.module.js';

import { MediaController } from './media.controller.js';
import { MediaGetSignedUrlForUploadUseCase } from './uc/media-get-signed-url-for-upload.uc.js';
import { MediaGetSignedUrlForViewUseCase } from './uc/media-get-signed-url-for-view.uc.js';

@Module({
  imports: [CommonDbModule, AppConfigModule, ServiceModule, ExternalServiceModule],
  controllers: [MediaController],
  providers: [CommonLoggerService, MediaGetSignedUrlForViewUseCase, MediaGetSignedUrlForUploadUseCase],
})
export class MediaModule {}
