import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@repo/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.PG_DATABASE_URL });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
