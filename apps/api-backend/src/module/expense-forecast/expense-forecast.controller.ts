import { Body, Controller, Get, Put } from '@nestjs/common';
import type { ExpenseForecastBulkSaveRequestType, ExpenseForecastResponseType, ExpenseForecastSummaryResponseType } from '@repo/dto';
import { ExpenseForecastBulkSaveRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { AdminOnly, CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { ExpenseForecastBulkSaveUc } from './uc/expense-forecast-bulk-save.uc.js';
import { ExpenseForecastListUc } from './uc/expense-forecast-list.uc.js';
import { ExpenseForecastSummaryUc } from './uc/expense-forecast-summary.uc.js';

@AdminOnly()
@Controller('api/expense-forecast')
export class ExpenseForecastController {
  constructor(
    private readonly listUc: ExpenseForecastListUc,
    private readonly bulkSaveUc: ExpenseForecastBulkSaveUc,
    private readonly summaryUc: ExpenseForecastSummaryUc,
  ) {}

  @Get()
  async list(@CurrentUser() currentUser: CurrentUserType): Promise<ExpenseForecastResponseType[]> {
    return this.listUc.execute({ currentUser });
  }

  @Get('/summary')
  async summary(@CurrentUser() currentUser: CurrentUserType): Promise<ExpenseForecastSummaryResponseType> {
    return this.summaryUc.execute({ currentUser });
  }

  @Put('/bulk')
  async bulkSave(
    @Body(new ZodValidationPipe(ExpenseForecastBulkSaveRequestSchema)) body: ExpenseForecastBulkSaveRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ExpenseForecastResponseType[]> {
    return this.bulkSaveUc.execute({ currentUser, dto: body });
  }
}
