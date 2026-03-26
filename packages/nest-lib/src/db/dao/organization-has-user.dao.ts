import { Injectable } from '@nestjs/common';
import type { Organization, Prisma, UserRoleDbEnum } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class OrganizationHasUserDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findByUserAndOrg(params: {
    userId: number;
    organizationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganizationHasUserSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    return (
      (await pc.organizationHasUser.findUnique({
        where: { organizationId_userId: { organizationId: params.organizationId, userId: params.userId } },
      })) ?? undefined
    );
  }

  public async findAllByUser(params: {
    userId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganizationHasUserSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findMany({ where: { userId: params.userId } });
  }

  public async findAllByUserWithOrganization(params: {
    userId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganizationHasUserWithOrganizationType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findMany({ where: { userId: params.userId }, include: { organization: true } });
  }

  public async findManyByUsersAndOrg(params: {
    userIds: number[];
    organizationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganizationHasUserSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organizationHasUser.findMany({
      where: { userId: { in: params.userIds }, organizationId: params.organizationId },
    });
  }

  public async create(params: {
    data: OrganizationHasUserInsertTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organizationHasUser.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('OrganizationHasUser not created');
    }
    return created.id;
  }

  public async upsert(params: {
    organizationId: number;
    userId: number;
    roles: UserRoleDbEnum[];
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasUser.upsert({
      where: { organizationId_userId: { organizationId: params.organizationId, userId: params.userId } },
      create: { organizationId: params.organizationId, userId: params.userId, roles: params.roles },
      update: { roles: params.roles },
    });
  }

  public async updateRoles(params: { id: number; roles: UserRoleDbEnum[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organizationHasUser.update({ where: { id: params.id }, data: { roles: params.roles } });
  }
}

// Type aliases
type OrganizationHasUserSelectTableRecordType = Prisma.OrganizationHasUserGetPayload<{}>;
type OrganizationHasUserInsertTableRecordType = Prisma.OrganizationHasUserCreateInput;
type OrganizationHasUserUpdateTableRecordType = Prisma.OrganizationHasUserUpdateInput;

// Custom return types
export type OrganizationHasUserWithOrganizationType = OrganizationHasUserSelectTableRecordType & {
  organization: Organization;
};
