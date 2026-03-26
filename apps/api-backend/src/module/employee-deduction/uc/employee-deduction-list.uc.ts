import { Injectable } from '@nestjs/common';
import type {
  EmployeeDeductionFilterRequestType,
  EmployeeDeductionResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import type { PayrollDeduction } from '@repo/db';
import {
  PayrollDeductionDao,
  EmployeeDao,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
} from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  filterDto: EmployeeDeductionFilterRequestType;
};

@Injectable()
export class EmployeeDeductionListUc implements IUseCase<Params, PaginatedResponseType<EmployeeDeductionResponseType>> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<EmployeeDeductionResponseType>> {
    this.logger.i('Listing employee deductions', { employeeId: params.filterDto.employeeId });

    const employee = await this.employeeDao.getByUserId({ userId: params.filterDto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const { dbRecords, totalRecords } = await this.payrollDeductionDao.findByUserIdWithPagination({
      userId: params.filterDto.employeeId,
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results = dbRecords.map((d: PayrollDeduction) => ({
      id: d.id,
      employeeId: d.userId,
      type: d.type,
      frequency: d.frequency,
      amount: d.amount,
      otherTitle: d.otherTitle,
      specificMonth: d.specificMonth?.toISOString().split('T')[0] ?? undefined,
      effectiveFrom: d.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: d.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: d.isActive,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
