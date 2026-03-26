import { Injectable } from '@nestjs/common';
import type { PayrollActiveCompensationFilterRequestType, PayrollActiveCompensationResponseType, PaginatedResponseType } from '@repo/dto';
import { PayrollCompensationDao, CommonLoggerService, CurrentUserType, IUseCase } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
  filterDto: PayrollActiveCompensationFilterRequestType;
};

@Injectable()
export class PayrollActiveCompensationListUc implements IUseCase<Params, PaginatedResponseType<PayrollActiveCompensationResponseType>> {
  constructor(
    private readonly logger: CommonLoggerService,
    private readonly payrollCompensationDao: PayrollCompensationDao,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<PayrollActiveCompensationResponseType>> {
    this.logger.i('Listing all active compensations for payroll');

    const { compensations, totalRecords } = await this.payrollCompensationDao.findActiveWithEmployeeInfo({
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results: PayrollActiveCompensationResponseType[] = compensations.map((c) => ({
      id: c.id,
      employeeId: c.userId,
      basic: c.basic,
      hra: c.hra,
      otherAllowances: c.otherAllowances,
      gross: c.gross,
      effectiveFrom: c.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: c.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: c.isActive,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      employeeFirstname: c.user.firstname,
      employeeLastname: c.user.lastname,
      employeeEmail: c.user.email,
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
