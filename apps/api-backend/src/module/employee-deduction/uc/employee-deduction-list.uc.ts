import { Injectable } from '@nestjs/common';
import type { EmployeeDeductionFilterRequestType, EmployeeDeductionResponseType, PaginatedResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, IUseCase, PayrollDeductionDao } from '@repo/nest-lib';
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

  public async execute(params: Params): Promise<PaginatedResponseType<EmployeeDeductionResponseType>> {
    this.logger.i('Listing employee deductions', { employeeId: params.filterDto.employeeId });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(params: Params): Promise<void> {
    const employee = await this.employeeDao.getByUserId({ userId: params.filterDto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }
  }

  private async search(params: Params): Promise<PaginatedResponseType<EmployeeDeductionResponseType>> {
    const { dbRecords, totalRecords } = await this.payrollDeductionDao.findByUserIdWithPagination({
      userId: params.filterDto.employeeId,
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results: EmployeeDeductionResponseType[] = dbRecords.map((d) => ({
      id: d.id,
      employeeId: d.userId,
      effectiveFrom: d.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: d.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: d.isActive,
      lineItems: d.payrollDeductionLineItems.map((li) => ({
        id: li.id,
        type: li.type,
        frequency: li.frequency,
        amount: li.amount,
        otherTitle: li.otherTitle,
        specificMonth: li.specificMonth?.toISOString().split('T')[0] ?? undefined,
      })),
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
