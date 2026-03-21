import { Module } from '@nestjs/common';

import { PayslipController } from './payslip.controller.js';
import { PayslipListUc } from './uc/payslip-list.uc.js';
import { PayslipGenerateUc } from './uc/payslip-generate.uc.js';
import { PayslipGetUc } from './uc/payslip-get.uc.js';
import { PayslipUpdateLineItemsUc } from './uc/payslip-update-line-items.uc.js';

@Module({
  controllers: [PayslipController],
  providers: [PayslipListUc, PayslipGenerateUc, PayslipGetUc, PayslipUpdateLineItemsUc],
})
export class PayslipModule {}
