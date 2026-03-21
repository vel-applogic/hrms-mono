import { Injectable } from '@nestjs/common';
import type { PayslipDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PayslipDao } from '@repo/nest-lib';
import type { PayslipWithDetailsType } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class PayslipGetUc implements IUseCase<Params, PayslipDetailResponseType> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payslipDao: PayslipDao,
  ) {}

  async execute(params: Params): Promise<PayslipDetailResponseType> {
    this.logger.i('Getting payslip', { id: params.id });

    const payslip = await this.payslipDao.getById({ id: params.id });
    if (!payslip) {
      throw new ApiError('Payslip not found', 404);
    }

    return this.mapToDetail(payslip);
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
