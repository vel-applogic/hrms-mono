import { Injectable } from '@nestjs/common';
import type { Organization, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class OrganizationDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Organization | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organization.findUnique({ where: { id: params.id } });
  }

  async findAll(params?: { tx?: Prisma.TransactionClient }): Promise<Organization[]> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.organization.findMany({ orderBy: { name: 'asc' } });
  }

  async create(params: { data: Prisma.OrganizationCreateInput; tx?: Prisma.TransactionClient }): Promise<Organization> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organization.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.OrganizationUpdateInput; tx?: Prisma.TransactionClient }): Promise<Organization> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organization.update({ where: { id: params.id }, data: params.data });
  }
}
