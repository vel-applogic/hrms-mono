import { Module } from '@nestjs/common';

import { AppConfigModule } from '#src/config/app-config.module.js';
import { S3Service } from '#src/external-service/s3.service.js';

@Module({
  imports: [AppConfigModule],
  providers: [S3Service],
  exports: [S3Service],
})
export class ExternalServiceModule {}
