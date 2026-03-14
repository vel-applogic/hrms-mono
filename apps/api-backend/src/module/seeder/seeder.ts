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
    this.logger.i('Seeding data complete');
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
