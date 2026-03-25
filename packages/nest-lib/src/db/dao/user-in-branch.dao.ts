import { Injectable } from '@nestjs/common';
import type { Prisma, UserInBranch } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class UserInBranchDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByUserAndBranch(params: { userId: number; branchId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranch | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findUnique({
      where: { userId_branchId: { userId: params.userId, branchId: params.branchId } },
    });
  }

  async findAllByUser(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranch[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findMany({ where: { userId: params.userId } });
  }

  async findAllByBranch(params: { branchId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranch[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findMany({ where: { branchId: params.branchId } });
  }

  async findAllByOrganization(params: { organizationId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranch[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findMany({ where: { organizationId: params.organizationId } });
  }

  async create(params: { data: Prisma.UserInBranchCreateInput; tx?: Prisma.TransactionClient }): Promise<UserInBranch> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.create({ data: params.data });
  }

  async delete(params: { userId: number; branchId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranch> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.delete({
      where: { userId_branchId: { userId: params.userId, branchId: params.branchId } },
    });
  }
}
