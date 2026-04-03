import { Injectable } from '@nestjs/common';
import { UserRoleDtoEnum } from '@repo/dto';
import { CommonLoggerService, PrismaService } from '@repo/nest-lib';

import { PasswordService } from '../../service/password.service.js';

@Injectable()
export class Seeder {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly logger: CommonLoggerService,
  ) {}

  async seed() {
    this.logger.i('Seeding data start');
    await this.runMigration('create-test-users', () =>
      this.createTestUsers([
        { email: 'superAdmin@test.com', firstname: 'Test', lastname: '01', organizationName: 'Test Organization', roles: [], isSuperAdmin: true },
        { email: 'admin@test.com', firstname: 'Test', lastname: '01', organizationName: 'Test Organization', roles: [UserRoleDtoEnum.admin], isSuperAdmin: false },
      ]),
    );
    await this.runMigration('init-employee-leave-counters', () => this.initEmployeeLeaveCounters());
    this.logger.i('Seeding data complete');
  }

  private async initEmployeeLeaveCounters() {
    const { getFinancialYearCode } = await import('@repo/shared');
    const orgSetting = await this.prisma.organizationSetting.findFirst({ orderBy: { createdAt: 'desc' } });
    const totalLeavesAvailable = orgSetting?.totalLeaveInDays ?? 24;
    const employees = await this.prisma.employee.findMany({ select: { userId: true, dateOfJoining: true, organizationId: true } });
    let created = 0;
    for (const emp of employees) {
      const financialYear = getFinancialYearCode(emp.dateOfJoining);
      const existing = await this.prisma.employeeLeaveCounter.findUnique({
        where: { userId_organizationId_financialYear: { userId: emp.userId, organizationId: emp.organizationId, financialYear } },
      });
      if (!existing) {
        await this.prisma.employeeLeaveCounter.create({
          data: {
            user: { connect: { id: emp.userId } },
            organization: { connect: { id: emp.organizationId } },
            financialYear,
            casualLeaves: 0,
            sickLeaves: 0,
            earnedLeaves: 0,
            totalLeavesUsed: 0,
            totalLeavesAvailable,
          },
        });
        created++;
      }
    }
    this.logger.i(`Employee leave counters initialized: ${created} created`);
  }

  private async runMigration(key: string, migration: () => Promise<void>) {
    const existing = await this.prisma.appMigration.findUnique({ where: { key } });
    if (existing) {
      this.logger.i(`Migration "${key}" already applied, skipping`);
      return;
    }

    this.logger.i(`Running migration "${key}"`);
    await migration();
    await this.prisma.appMigration.create({ data: { key } });
    this.logger.i(`Migration "${key}" complete`);
  }

  private async createTestUsers(users: { email: string; firstname: string; lastname: string; organizationName: string; roles: UserRoleDtoEnum[]; isSuperAdmin: boolean }[]) {
    const hashedPassword = await this.passwordService.hash('test');

    for (const userData of users) {
      let organisation = await this.prisma.organization.findFirst({ where: { name: userData.organizationName } });
      if (!organisation) {
        organisation = await this.prisma.organization.create({
          data: {
            name: userData.organizationName,
            currency: { connect: { id: 1 } },
          },
        });
      }

      const user = await this.prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          firstname: userData.firstname,
          lastname: userData.lastname,
          password: hashedPassword,
          isActive: true,
          isSuperAdmin: userData.isSuperAdmin,
        },
      });

      await this.prisma.organizationHasUser.upsert({
        where: { organizationId_userId: { organizationId: organisation.id, userId: user.id } },
        update: { roles: userData.roles },
        create: {
          userId: user.id,
          organizationId: organisation.id,
          roles: userData.roles,
        },
      });
    }

    this.logger.i('Test users created');
  }
}
