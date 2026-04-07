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
  public constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(params: Params): Promise<string> {
    this.logger.i('Getting payslip PDF signed URL', { id: params.id });
    const validateResult = await this.validate(params);
    return await this.download(params, validateResult);
  }

  private async validate(params: Params): Promise<{ pdfS3Key: string }> {
    const payslip = await this.payrollPayslipDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }
    return { pdfS3Key: payslip.pdfS3Key };
  }

  private async download(_params: Params, validateResult: { pdfS3Key: string }): Promise<string> {
    return this.s3Service.getSignedUrl(validateResult.pdfS3Key);
  }
}
