import { Injectable } from '@nestjs/common';
import type { PayslipWithDetailsType } from '@repo/nest-lib';
import { CommonLoggerService, CurrentUserType, IUseCase, PayslipDao } from '@repo/nest-lib';
import type { PayslipDetailResponseType } from '@repo/dto';
import { buildPayslipTemplateData } from '@repo/shared';
import { ApiError } from '@repo/shared';

import { PdfGeneratorService } from '../../../service/pdf/pdf-generator.service.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PayslipDownloadUc implements IUseCase<Params, Buffer> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payslipDao: PayslipDao,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async execute(params: Params): Promise<Buffer> {
    this.logger.i('Downloading payslip PDF', { id: params.id });

    const payslip = await this.payslipDao.getById({ id: params.id });
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }

    const pdfData = buildPayslipTemplateData(this.mapToDetail(payslip));
    return this.pdfGeneratorService.generatePayslipPdf(pdfData);
  }

  private mapToDetail(p: PayslipWithDetailsType): PayslipDetailResponseType {
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
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      lineItems: p.payslipLineItems.map((li) => ({
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
