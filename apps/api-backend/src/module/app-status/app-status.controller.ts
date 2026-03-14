import { Controller, Get } from '@nestjs/common';
import type { AppStatusType } from '@repo/dto';

import { AppStatusGetUc } from './uc/app-status-get.uc.js';

@Controller('app/status')
export class AppStatusController {
  constructor(private readonly appStatusGetUc: AppStatusGetUc) {}

  @Get()
  async getStatus(): Promise<AppStatusType> {
    return this.appStatusGetUc.execute();
  }
}
