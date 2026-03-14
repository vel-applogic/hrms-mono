import { Injectable } from '@nestjs/common';
import type { Chapter, Media, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';
import { FilterRequestType } from '@repo/dto';

@Injectable()
export class ChapterDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.ChapterCreateInput; tx?: Prisma.TransactionClient }): Promise<Chapter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.chapter.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.ChapterUpdateInput; tx?: Prisma.TransactionClient }): Promise<Chapter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.chapter.update({ where: { id: params.id }, data: params.data });
  }

  public async search(params: {
    filterDto: FilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: ChapterListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.ChapterWhereInput = {
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
        {
          summaryPoints: {
            has: params.filterDto.search,
          },
        },
      ];
    }


    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.chapter.count({ where }),
      pc.chapter.findMany({
        where,
        take: take,
        skip: skip,
        orderBy,
      }),
    ]);


    return { dbRecords, totalRecords };
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Chapter & { media: Media | null } | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.chapter.findUnique({ where: { id: params.id }, include: { media: true } });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Chapter> {
    const pc = this.getPrismaClient(params.tx);
    return pc.chapter.delete({ where: { id: params.id } });
  }

}

type ChapterListRecordType = Prisma.ChapterGetPayload<{}>
