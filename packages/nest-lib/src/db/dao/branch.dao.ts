import { Injectable } from '@nestjs/common';
import type { Branch, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class BranchDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Branch | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.branch.findUnique({ where: { id: params.id } });
  }

  async findByOrganizationId(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<Branch[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.branch.findMany({ where: { organizationId: params.organizationId }, orderBy: { name: 'asc' } });
  }

  async create(params: { data: Prisma.BranchCreateInput; tx?: Prisma.TransactionClient }): Promise<Branch> {
    const pc = this.getPrismaClient(params.tx);
    return pc.branch.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.BranchUpdateInput; tx?: Prisma.TransactionClient }): Promise<Branch> {
    const pc = this.getPrismaClient(params.tx);
    return pc.branch.update({ where: { id: params.id }, data: params.data });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Branch> {
    const pc = this.getPrismaClient(params.tx);
    return pc.branch.delete({ where: { id: params.id } });
  }
}
