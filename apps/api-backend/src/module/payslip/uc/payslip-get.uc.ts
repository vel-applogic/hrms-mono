import { Injectable } from '@nestjs/common';
import type { PayslipDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PayrollPayslipDao } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PayslipGetUc implements IUseCase<Params, PayslipDetailResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly s3Service: S3Service,
  ) {}

  async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Getting payslip', { id: params.id });

    const payslip = await this.payrollPayslipDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }

    const pdfSignedUrl = payslip.pdfS3Key ? await this.s3Service.getSignedUrl(payslip.pdfS3Key) : null;

    return this.mapToDetail(payslip, pdfSignedUrl);
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType, pdfSignedUrl: string | null): PayslipDetailResponseType {
    return {
      id: p.id,
      employeeId: p.userId,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
      employeeDesignation: p.user.employees?.[0]?.designation ?? '',
      month: p.month,
      year: p.year,
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      deductionAmount: p.deductionAmount,
      pdfSignedUrl,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lineItems: p.payrollPayslipLineItems.map((li) => ({
        id: li.id,
        payslipId: li.payslipId,
        type: li.type,
        title: li.title,
        amount: li.amount,
        createdAt: li.createdAt.toISOString(),
        updatedAt: li.updatedAt.toISOString(),
      })),
    };
  }
}
