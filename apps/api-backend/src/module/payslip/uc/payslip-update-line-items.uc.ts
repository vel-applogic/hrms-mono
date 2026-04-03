import { Injectable } from '@nestjs/common';
import type { PayslipDetailResponseType, PayslipUpdateLineItemsRequestType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, OrganizationDao, PayrollPayslipDao, PrismaService } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '../../../external-service/s3.service.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: PayslipUpdateLineItemsRequestType;
};

@Injectable()
export class PayslipUpdateLineItemsUc implements IUseCase<Params, PayslipDetailResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
    private readonly organizationDao: OrganizationDao,
    private readonly s3Service: S3Service,
  ) {}

  async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Updating payslip line items', { id: params.id });

    const existing = await this.payrollPayslipDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Payslip not found', 404);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      return this.payrollPayslipDao.replaceLineItems({
        payslipId: params.id,
        lineItems: params.dto.lineItems.map((li) => ({
          type: li.type,
          title: li.title,
          amount: li.amount,
        })),
        tx,
      });
    });

    if (!updated) {
      throw new ApiError('Failed to update payslip line items', 500);
    }

    const org = await this.organizationDao.getByIdWithLogoOrThrow({ id: params.currentUser.organizationId });
    const companyLogoUrl = org.logo ? await this.s3Service.getSignedUrl(org.logo.key) : null;

    return this.mapToDetail(updated, org.name, companyLogoUrl);
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType, companyName: string, companyLogoUrl: string | null): PayslipDetailResponseType {
    return {
      id: p.id,
      employeeId: p.userId,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
      employeeDesignation: p.user.employees?.[0]?.designation ?? '',
      companyName,
      companyLogoUrl,
      month: p.month,
      year: p.year,
      grossAmount: p.grossAmount,
      netAmount: p.netAmount,
      deductionAmount: p.deductionAmount,
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
