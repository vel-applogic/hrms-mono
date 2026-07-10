import { Injectable } from '@nestjs/common';
import type { LeaveCounterResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, EmployeeLeaveCounterDao, IUseCase, OrganisationSettingDao, PrismaService } from '@repo/nest-lib';
import { getFinancialYearDateRange } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  financialYear: string;
};

@Injectable()
export class LeaveCountersListUc implements IUseCase<Params, LeaveCounterResponseType[]> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly employeeLeaveCounterDao: EmployeeLeaveCounterDao,
    private readonly organisationSettingDao: OrganisationSettingDao,
  ) {}

  public async execute(params: Params): Promise<LeaveCounterResponseType[]> {
    this.logger.i('Listing leave counters', { financialYear: params.financialYear });
    await this.validate(params);
    return await this.countersList(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
  }

  private async countersList(params: Params): Promise<LeaveCounterResponseType[]> {
    const orgSettings = await this.organisationSettingDao.findByOrganisationId({ organisationId: params.currentUser.organisationId });
    const activeBetween = getFinancialYearDateRange(params.financialYear, orgSettings?.financialYearStartsAt);

    const [employees, counters] = await Promise.all([
      this.employeeDao.findAllWithUser({ organisationId: params.currentUser.organisationId, activeBetween }),
      this.employeeLeaveCounterDao.findManyByFinancialYear({ financialYear: params.financialYear, organisationId: params.currentUser.organisationId }),
    ]);

    const maxLeaves = orgSettings?.totalLeaveInDays ?? 24;
    const counterMap = new Map(counters.map((c) => [c.userId, c]));

    return employees.map((emp) => {
      const counter = counterMap.get(emp.userId);
      return {
        id: counter?.id ?? 0,
        userId: emp.userId,
        employeeCode: emp.employeeCode,
        financialYear: params.financialYear,
        casualLeaves: counter?.casualLeaves ?? 0,
        sickLeaves: counter?.sickLeaves ?? 0,
        earnedLeaves: counter?.earnedLeaves ?? 0,
        totalLeavesUsed: counter?.totalLeavesUsed ?? 0,
        totalLeavesAvailable: counter?.totalLeavesAvailable ?? maxLeaves,
        user: {
          id: emp.user.id,
          firstname: emp.user.firstname,
          lastname: emp.user.lastname,
          email: emp.user.email,
        },
      };
    });
  }
}
