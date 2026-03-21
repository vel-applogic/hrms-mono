import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonDbModule, CommonLoggerService } from '@repo/nest-lib';

import { AppConfigService } from '#src/config/app-config.service.js';
import { ExternalServiceModule } from '#src/external-service/external-service.module.js';
import { EmailService } from '#src/service/email/email.service.js';

import { MediaService } from './media.service.js';
import { PasswordService } from './password.service.js';
import { PdfGeneratorService } from './pdf/pdf-generator.service.js';

@Module({
  imports: [CommonDbModule, ExternalServiceModule],
  controllers: [],
  providers: [ConfigService, AppConfigService, EmailService, PasswordService, CommonLoggerService, MediaService, PdfGeneratorService],
  exports: [EmailService, PasswordService, MediaService, PdfGeneratorService],
})
export class ServiceModule {}
