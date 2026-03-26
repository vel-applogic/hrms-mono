import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class UserInBranchDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findByUserAndBranch(params: {
    userId: number;
    branchId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<UserInBranchSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    return (
      (await pc.userInBranch.findUnique({
        where: { userId_branchId: { userId: params.userId, branchId: params.branchId } },
      })) ?? undefined
    );
  }

  public async findAllByUser(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranchSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findMany({ where: { userId: params.userId } });
  }

  public async findAllByBranch(params: { branchId: number; tx?: Prisma.TransactionClient }): Promise<UserInBranchSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findMany({ where: { branchId: params.branchId } });
  }

  public async findAllByOrganization(params: {
    organizationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<UserInBranchSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.userInBranch.findMany({ where: { organizationId: params.organizationId } });
  }

  public async create(params: { data: UserInBranchInsertTableRecordType; tx: Prisma.TransactionClient }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.userInBranch.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('UserInBranch not created');
    }
    return created.id;
  }

  public async delete(params: { userId: number; branchId: number; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.userInBranch.delete({
      where: { userId_branchId: { userId: params.userId, branchId: params.branchId } },
    });
  }
}

// Type aliases
type UserInBranchSelectTableRecordType = Prisma.UserInBranchGetPayload<{}>;
type UserInBranchInsertTableRecordType = Prisma.UserInBranchCreateInput;
type UserInBranchUpdateTableRecordType = Prisma.UserInBranchUpdateInput;
