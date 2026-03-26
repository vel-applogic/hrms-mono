import { Injectable } from '@nestjs/common';
import type { PayslipDetailResponseType, PayslipUpdateLineItemsRequestType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PayrollPayslipDao } from '@repo/nest-lib';
import type { PayrollPayslipWithDetailsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: PayslipUpdateLineItemsRequestType;
};

@Injectable()
export class PayslipUpdateLineItemsUc implements IUseCase<Params, PayslipDetailResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollPayslipDao: PayrollPayslipDao,
  ) {}

  async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Updating payslip line items', { id: params.id });

    const existing = await this.payrollPayslipDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Payslip not found', 404);
    }

    const updated = await this.payrollPayslipDao.replaceLineItems({
      payslipId: params.id,
      lineItems: params.dto.lineItems.map((li) => ({
        type: li.type,
        title: li.title,
        amount: li.amount,
      })),
    });

    if (!updated) {
      throw new ApiError('Failed to update payslip line items', 500);
    }

    return this.mapToDetail(updated);
  }

  private mapToDetail(p: PayrollPayslipWithDetailsType): PayslipDetailResponseType {
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
