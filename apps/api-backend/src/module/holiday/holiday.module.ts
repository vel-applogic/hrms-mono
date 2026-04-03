import { Module } from '@nestjs/common';

import { HolidayController } from './holiday.controller.js';
import { HolidayCreateUc } from './uc/holiday-create.uc.js';
import { HolidayDeleteUc } from './uc/holiday-delete.uc.js';
import { HolidayListUc } from './uc/holiday-list.uc.js';
import { HolidayUpdateUc } from './uc/holiday-update.uc.js';
import { HolidayYearsUc } from './uc/holiday-years.uc.js';

@Module({
  controllers: [HolidayController],
  providers: [HolidayListUc, HolidayYearsUc, HolidayCreateUc, HolidayUpdateUc, HolidayDeleteUc],
})
export class HolidayModule {}
