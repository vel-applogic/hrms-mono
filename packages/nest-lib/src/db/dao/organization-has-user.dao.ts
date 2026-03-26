import { Injectable } from '@nestjs/common';
import type { Organization, OrganizationHasUser, Prisma, UserRoleDbEnum } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class OrganizationHasUserDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByUserAndOrg(params: { userId: number; organizationId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationHasUser | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findUnique({
      where: { organizationId_userId: { organizationId: params.organizationId, userId: params.userId } },
    });
  }

  async findAllByUser(params: { userId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationHasUser[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findMany({ where: { userId: params.userId } });
  }

  async findAllByUserWithOrganization(params: {
    userId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<(OrganizationHasUser & { organization: Organization })[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findMany({ where: { userId: params.userId }, include: { organization: true } });
  }

  async findManyByUsersAndOrg(params: { userIds: number[]; organizationId: number; tx?: Prisma.TransactionClient }): Promise<OrganizationHasUser[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findMany({
      where: { userId: { in: params.userIds }, organizationId: params.organizationId },
    });
  }

  async create(params: { data: Prisma.OrganizationHasUserCreateInput; tx?: Prisma.TransactionClient }): Promise<OrganizationHasUser> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.create({ data: params.data });
  }

  async upsert(params: { organizationId: number; userId: number; roles: UserRoleDbEnum[]; tx?: Prisma.TransactionClient }): Promise<OrganizationHasUser> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.upsert({
      where: { organizationId_userId: { organizationId: params.organizationId, userId: params.userId } },
      create: { organizationId: params.organizationId, userId: params.userId, roles: params.roles },
      update: { roles: params.roles },
    });
  }

  async updateRoles(params: { id: number; roles: UserRoleDbEnum[]; tx?: Prisma.TransactionClient }): Promise<OrganizationHasUser> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.update({ where: { id: params.id }, data: { roles: params.roles } });
  }
}
