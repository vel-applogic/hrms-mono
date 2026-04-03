import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';

import { TrackQuery } from '../../decorator/track-query.decorator.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
@TrackQuery()
export class CountryDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  public async findAll(params?: { tx?: Prisma.TransactionClient }): Promise<CountrySelectTableRecordType[]> {
    const pc = this.getPrismaClient(params?.tx);
    return pc.country.findMany({ orderBy: { name: 'asc' } });
  }
}

// Type definitions
type CountrySelectTableRecordType = Prisma.CountryGetPayload<{}>;

export type { CountrySelectTableRecordType };
