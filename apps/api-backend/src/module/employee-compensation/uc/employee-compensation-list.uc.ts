import { Injectable } from '@nestjs/common';
import type { EmployeeCompensationFilterRequestType, EmployeeCompensationResponseType, PaginatedResponseType } from '@repo/dto';
import { PayrollCompensationDao, EmployeeDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  filterDto: EmployeeCompensationFilterRequestType;
};

@Injectable()
export class EmployeeCompensationListUc implements IUseCase<Params, PaginatedResponseType<EmployeeCompensationResponseType>> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollCompensationDao: PayrollCompensationDao,
  ) {}

  public async execute(params: Params): Promise<PaginatedResponseType<EmployeeCompensationResponseType>> {
    this.logger.i('Listing employee compensations', { employeeId: params.filterDto.employeeId });
    await this.validate(params);
    return await this.search(params);
  }

  private async validate(params: Params): Promise<void> {
    const employee = await this.employeeDao.getByUserId({ userId: params.filterDto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }
  }

  private async search(params: Params): Promise<PaginatedResponseType<EmployeeCompensationResponseType>> {
    const { dbRecords, totalRecords } = await this.payrollCompensationDao.findByUserIdWithPagination({
      userId: params.filterDto.employeeId,
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results: EmployeeCompensationResponseType[] = dbRecords.map((c) => ({
      id: c.id,
      employeeId: c.userId,
      grossAmount: c.grossAmount,
      effectiveFrom: c.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: c.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: c.isActive,
      lineItems: c.payrollCompensationLineItems.map((li) => ({
        id: li.id,
        title: li.title,
        amount: li.amount,
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
