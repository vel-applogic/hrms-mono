import { Module } from '@nestjs/common';

import { AppStatusController } from './app-status.controller.js';
import { AppStatusGetUc } from './uc/app-status-get.uc.js';

@Module({
  controllers: [AppStatusController],
  providers: [AppStatusGetUc],
})
export class AppStatusModule {}
