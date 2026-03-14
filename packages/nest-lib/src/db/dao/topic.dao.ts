import { Injectable } from '@nestjs/common';
import type { Topic, Media, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';
import { TopicFilterRequestType } from '@repo/dto';

@Injectable()
export class TopicDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.TopicCreateInput; tx?: Prisma.TransactionClient }): Promise<Topic> {
    const pc = this.getPrismaClient(params.tx);
    return pc.topic.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.TopicUpdateInput; tx?: Prisma.TransactionClient }): Promise<Topic> {
    const pc = this.getPrismaClient(params.tx);
    return pc.topic.update({ where: { id: params.id }, data: params.data });
  }

  public async search(params: {
    filterDto: TopicFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: TopicListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.TopicWhereInput = {};

    if (params.filterDto.chapterId) {
      where.chapterId = params.filterDto.chapterId;
    }

    if (params.filterDto.search) {
      where.OR = [
        {
          title: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.topic.count({ where }),
      pc.topic.findMany({
        where,
        take: take,
        skip: skip,
        orderBy,
        include: {
          chapter: {
            select: { title: true },
          },
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<(Topic & { media: Media | null }) | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.topic.findUnique({ where: { id: params.id }, include: { media: true } });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Topic> {
    const pc = this.getPrismaClient(params.tx);
    return pc.topic.delete({ where: { id: params.id } });
  }

  async deleteManyByChapterId(params: { chapterId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.topic.deleteMany({ where: { chapterId: params.chapterId } });
  }
}

export type TopicListRecordType = Prisma.TopicGetPayload<{
  include: { chapter: { select: { title: true } } };
}>;
