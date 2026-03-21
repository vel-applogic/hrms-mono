import { Injectable } from '@nestjs/common';
import type { PayslipFilterRequestType, PayslipListResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PayslipDao } from '@repo/nest-lib';
import type { PayslipWithUserType } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
  filterDto: PayslipFilterRequestType;
};

@Injectable()
export class PayslipListUc implements IUseCase<Params, PaginatedResponseType<PayslipListResponseType>> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payslipDao: PayslipDao,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<PayslipListResponseType>> {
    this.logger.i('Listing payslips', { month: params.filterDto.month, year: params.filterDto.year });

    const { payslips, totalRecords } = await this.payslipDao.findWithPagination({
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      month: params.filterDto.month,
      year: params.filterDto.year,
      employeeIds: params.filterDto.employeeIds,
    });

    const results: PayslipListResponseType[] = payslips.map((p: PayslipWithUserType) => ({
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
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
