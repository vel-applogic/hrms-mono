import { Module } from '@nestjs/common';

import { DashboardController } from './dashboard.controller.js';
import { DashboardStatsUc } from './uc/dashboard-stats.uc.js';

@Module({
  controllers: [DashboardController],
  providers: [DashboardStatsUc],
})
export class DashboardModule {}
