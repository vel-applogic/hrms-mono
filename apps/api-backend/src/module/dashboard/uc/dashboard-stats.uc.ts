import { Injectable } from '@nestjs/common';
import type { DashboardStatsResponseType } from '@repo/dto';
import {
  BaseUc,
  CandidateDao,
  CommonLoggerService,
  CurrentUserType,
  EmployeeDao,
  IUseCase,
  PayrollCompensationDao,
  PayrollDeductionDao,
  PrismaService,
} from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class DashboardStatsUc extends BaseUc implements IUseCase<Params, DashboardStatsResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly candidateDao: CandidateDao,
    private readonly employeeDao: EmployeeDao,
    private readonly payrollCompensationDao: PayrollCompensationDao,
    private readonly payrollDeductionDao: PayrollDeductionDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<DashboardStatsResponseType> {
    this.logger.i('Getting dashboard stats');
    this.assertAdmin(params.currentUser);

    const organizationId = params.currentUser.organizationId;

    const [
      candidateCountByStatus,
      employeeCountByStatus,
      employeesWithoutReportTo,
      activeEmployeeUserIds,
      compensationUserIds,
      deductionUserIds,
    ] = await Promise.all([
      this.candidateDao.countByStatus({ organizationId }),
      this.employeeDao.countByStatus({ organizationId }),
      this.employeeDao.countActiveWithoutReportTo({ organizationId }),
      this.employeeDao.findActiveUserIds({ organizationId }),
      this.payrollCompensationDao.findActiveUserIds({ organizationId }),
      this.payrollDeductionDao.findDistinctUserIds({ organizationId }),
    ]);

    const compensationUserIdSet = new Set(compensationUserIds);
    const deductionUserIdSet = new Set(deductionUserIds);

    const employeesWithoutCompensation = activeEmployeeUserIds.filter((id) => !compensationUserIdSet.has(id)).length;
    const employeesWithoutDeduction = activeEmployeeUserIds.filter((id) => !deductionUserIdSet.has(id)).length;

    return {
      candidateCountByStatus,
      employeeCountByStatus,
      employeesWithoutReportTo,
      employeesWithoutCompensation,
      employeesWithoutDeduction,
    };
  }
}
