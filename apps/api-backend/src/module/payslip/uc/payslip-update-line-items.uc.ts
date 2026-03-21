import { Injectable } from '@nestjs/common';
import type { PayslipDetailResponseType, PayslipUpdateLineItemsRequestType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PayslipDao } from '@repo/nest-lib';
import type { PayslipWithDetailsType } from '@repo/nest-lib';
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
    private readonly payslipDao: PayslipDao,
  ) {}

  async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Updating payslip line items', { id: params.id });

    const existing = await this.payslipDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Payslip not found', 404);
    }

    const updated = await this.payslipDao.replaceLineItems({
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

  private mapToDetail(p: PayslipWithDetailsType): PayslipDetailResponseType {
    return {
      id: p.id,
      employeeId: p.userId,
      employeeFirstname: p.user.firstname,
      employeeLastname: p.user.lastname,
      employeeEmail: p.user.email,
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
