import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

import { AppConfigService } from './app-config.service.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        APP_ENV: Joi.string().valid('local', 'dev', 'staging', 'prod').required(),
        PG_DATABASE_URL: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        WEB_APP_BASE_URL: Joi.string().required(),
        SALT_ROUNDS: Joi.number().required(),
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
