import { Injectable } from '@nestjs/common';
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
    await this.runMigration('create-test-users', () => this.createTestUsers());
    await this.runMigration('create-leave-config', () => this.createLeaveConfig());
    await this.runMigration('init-employee-leave-counters', () => this.initEmployeeLeaveCounters());
    this.logger.i('Seeding data complete');
  }

  private async initEmployeeLeaveCounters() {
    const { getFinancialYearCode } = await import('@repo/shared');
    const config = await this.prisma.leaveConfig.findFirst({ orderBy: { createdAt: 'desc' } });
    const totalLeavesAvailable = config?.maxLeaves ?? 24;
    const employees = await this.prisma.userEmployeeDetail.findMany({ select: { userId: true, dateOfJoining: true } });
    let created = 0;
    for (const emp of employees) {
      const financialYear = getFinancialYearCode(emp.dateOfJoining);
      const existing = await this.prisma.userEmployeeLeaveCounter.findUnique({
        where: { userId_financialYear: { userId: emp.userId, financialYear } },
      });
      if (!existing) {
        await this.prisma.userEmployeeLeaveCounter.create({
          data: {
            userId: emp.userId,
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

  private async createLeaveConfig() {
    const existing = await this.prisma.leaveConfig.findFirst();
    if (existing) {
      this.logger.i('LeaveConfig already exists, skipping');
      return;
    }
    await this.prisma.leaveConfig.create({
      data: {
        maxLeaves: 24,
        maxEarnedLeaves: 10,
        maxSickLeaves: 7,
        maxCasualLeaves: 7,
      },
    });
    this.logger.i('LeaveConfig created');
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

  private async createTestUsers() {
    const hashedPassword = await this.passwordService.hash('test');

    await this.prisma.user.upsert({
      where: { email: 'karan@test.com' },
      update: {},
      create: {
        email: 'test@test.com',
        firstname: 'Test',
        lastname: '01',
        role: 'admin',
        password: hashedPassword,
        isActive: true,
      },
    });

    this.logger.i('Test users created');
  }
}
