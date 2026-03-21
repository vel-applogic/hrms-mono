import { Module } from '@nestjs/common';

import { ServiceModule } from '../../service/service.module.js';
import { PayslipController } from './payslip.controller.js';
import { PayslipListUc } from './uc/payslip-list.uc.js';
import { PayslipGenerateUc } from './uc/payslip-generate.uc.js';
import { PayslipGetUc } from './uc/payslip-get.uc.js';
import { PayslipUpdateLineItemsUc } from './uc/payslip-update-line-items.uc.js';
import { PayslipDownloadUc } from './uc/payslip-download.uc.js';

@Module({
  imports: [ServiceModule],
  controllers: [PayslipController],
  providers: [PayslipListUc, PayslipGenerateUc, PayslipGetUc, PayslipUpdateLineItemsUc, PayslipDownloadUc],
})
export class PayslipModule {}
