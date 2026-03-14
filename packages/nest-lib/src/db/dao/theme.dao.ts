import { Injectable } from '@nestjs/common';
import type { Theme, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';
import { FilterRequestType } from '@repo/dto';

@Injectable()
export class ThemeDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.ThemeCreateInput; tx?: Prisma.TransactionClient }): Promise<Theme> {
    const pc = this.getPrismaClient(params.tx);
    return pc.theme.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.ThemeUpdateInput; tx?: Prisma.TransactionClient }): Promise<Theme> {
    const pc = this.getPrismaClient(params.tx);
    return pc.theme.update({ where: { id: params.id }, data: params.data });
  }

  public async search(params: {
    filterDto: FilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: ThemeListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.ThemeWhereInput = {
    };

    if (params.filterDto.search) {
      where.OR = [
        {
          title: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
      ];
    }


    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.theme.count({ where }),
      pc.theme.findMany({
        where,
        take: take,
        skip: skip,
        orderBy,
      }),
    ]);


    return { dbRecords, totalRecords };
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Theme | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.theme.findUnique({ where: { id: params.id } });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Theme> {
    const pc = this.getPrismaClient(params.tx);
    return pc.theme.delete({ where: { id: params.id } });
  }

}

type ThemeListRecordType = Prisma.ThemeGetPayload<{}>
