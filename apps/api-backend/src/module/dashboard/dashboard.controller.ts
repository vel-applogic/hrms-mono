import { Controller, Get } from '@nestjs/common';
import type { DashboardStatsResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { AdminOnly, CurrentUser } from '@repo/nest-lib';

import { DashboardStatsUc } from './uc/dashboard-stats.uc.js';

@AdminOnly()
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly statsUc: DashboardStatsUc) {}

  @Get('/stats')
  async stats(@CurrentUser() currentUser: CurrentUserType): Promise<DashboardStatsResponseType> {
    return this.statsUc.execute({ currentUser });
  }
}
