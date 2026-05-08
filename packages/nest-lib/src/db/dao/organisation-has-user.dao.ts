import { Injectable } from '@nestjs/common';
import type { Organisation, Prisma, UserRoleDbEnum } from '@repo/db';
import { DbOperationError } from '@repo/shared';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class OrganisationHasUserDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findByUserAndOrg(params: {
    userId: number;
    organisationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganisationHasUserSelectTableRecordType | undefined> {
    const pc = this.getPrismaClient(params.tx);
    return (
      (await pc.organisationHasUser.findUnique({
        where: { organisationId_userId: { organisationId: params.organisationId, userId: params.userId } },
      })) ?? undefined
    );
  }

  public async findAllByUser(params: {
    userId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganisationHasUserSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organisationHasUser.findMany({ where: { userId: params.userId } });
  }

  public async findAllByUserWithOrganisation(params: {
    userId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganisationHasUserWithOrganisationType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organisationHasUser.findMany({ where: { userId: params.userId }, include: { organisation: true } });
  }

  public async findManyByUsersAndOrg(params: {
    userIds: number[];
    organisationId: number;
    tx?: Prisma.TransactionClient;
  }): Promise<OrganisationHasUserSelectTableRecordType[]> {
    const pc = this.getPrismaClient(params.tx);
    return pc.organisationHasUser.findMany({
      where: { userId: { in: params.userIds }, organisationId: params.organisationId },
    });
  }

  public async create(params: {
    data: OrganisationHasUserInsertTableRecordType;
    tx: Prisma.TransactionClient;
  }): Promise<number> {
    const pc = this.getPrismaClient(params.tx);
    const created = await pc.organisationHasUser.create({ data: params.data });
    if (!created?.id) {
      throw new DbOperationError('OrganisationHasUser not created');
    }
    return created.id;
  }

  public async upsert(params: {
    organisationId: number;
    userId: number;
    roles: UserRoleDbEnum[];
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasUser.upsert({
      where: { organisationId_userId: { organisationId: params.organisationId, userId: params.userId } },
      create: { organisationId: params.organisationId, userId: params.userId, roles: params.roles },
      update: { roles: params.roles },
    });
  }

  public async updateRoles(params: { id: number; roles: UserRoleDbEnum[]; tx: Prisma.TransactionClient }): Promise<void> {
    const pc = this.getPrismaClient(params.tx);
    await pc.organisationHasUser.update({ where: { id: params.id }, data: { roles: params.roles } });
  }
}

// Type aliases
type OrganisationHasUserSelectTableRecordType = Prisma.OrganisationHasUserGetPayload<{}>;
type OrganisationHasUserInsertTableRecordType = Prisma.OrganisationHasUserCreateInput;
type OrganisationHasUserUpdateTableRecordType = Prisma.OrganisationHasUserUpdateInput;

// Custom return types
export type OrganisationHasUserWithOrganisationType = OrganisationHasUserSelectTableRecordType & {
  organisation: Organisation;
};
