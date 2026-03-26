import { Injectable } from '@nestjs/common';
import type { LeaveCounterResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeDao, EmployeeLeaveCounterDao, IUseCase, LeaveConfigDao, PrismaService } from '@repo/nest-lib';

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
    private readonly leaveConfigDao: LeaveConfigDao,
  ) {}

  async execute(params: Params): Promise<LeaveCounterResponseType[]> {
    this.logger.i('Listing leave counters', { financialYear: params.financialYear });

    const [employees, counters, leaveConfig] = await Promise.all([
      this.employeeDao.findAllWithUser({ organizationId: params.currentUser.organizationId }),
      this.employeeLeaveCounterDao.findManyByFinancialYear({ financialYear: params.financialYear, organizationId: params.currentUser.organizationId }),
      this.leaveConfigDao.getLatest(),
    ]);

    const maxLeaves = leaveConfig?.maxLeaves ?? 24;
    const counterMap = new Map(counters.map((c) => [c.userId, c]));

    return employees.map((emp) => {
      const counter = counterMap.get(emp.userId);
      return {
        id: counter?.id ?? 0,
        userId: emp.userId,
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
