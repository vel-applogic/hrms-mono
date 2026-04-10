import { Module } from '@nestjs/common';

import { ExpenseForecastController } from './expense-forecast.controller.js';
import { ExpenseForecastBulkSaveUc } from './uc/expense-forecast-bulk-save.uc.js';
import { ExpenseForecastListUc } from './uc/expense-forecast-list.uc.js';
import { ExpenseForecastSummaryUc } from './uc/expense-forecast-summary.uc.js';

@Module({
  controllers: [ExpenseForecastController],
  providers: [ExpenseForecastListUc, ExpenseForecastBulkSaveUc, ExpenseForecastSummaryUc],
})
export class ExpenseForecastModule {}
