import { Injectable } from '@nestjs/common';
import { CommonLoggerService, CurrentUserType, IUseCase, PayrollPayslipDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PayslipDownloadUc implements IUseCase<Params, string> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly s3Service: S3Service,
  ) {}

  async execute(params: Params): Promise<string> {
    this.logger.i('Getting payslip PDF signed URL', { id: params.id });

    const payslip = await this.payrollPayslipDao.getById({ id: params.id });
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }

    return this.s3Service.getSignedUrl(payslip.pdfS3Key);
  }
}
