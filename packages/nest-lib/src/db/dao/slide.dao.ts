import { Injectable } from '@nestjs/common';
import type { Prisma, Slide } from '@repo/db';

import { SlideFilterRequestType } from '@repo/dto';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
export class SlideDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.SlideCreateInput; tx?: Prisma.TransactionClient }): Promise<Slide> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slide.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.SlideUpdateInput; tx?: Prisma.TransactionClient }): Promise<Slide> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slide.update({ where: { id: params.id }, data: params.data });
  }

  public async search(params: {
    filterDto: SlideFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: SlideListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.SlideWhereInput = {};

    if (params.filterDto.topicId) {
      where.topicId = params.filterDto.topicId;
    }

    if (params.filterDto.chapterId) {
      where.chapterId = params.filterDto.chapterId;
    }

    if (params.filterDto.themeIds && params.filterDto.themeIds.length > 0) {
      where.slideHasThemes = {
        some: {
          themeId: { in: params.filterDto.themeIds },
        },
      };
    }

    // FIXME: fix content search
    // if (params.filterDto.search) {
    //   where.OR = [
    //     {
    //       content: {
    //         contains: params.filterDto.search,
    //         mode: 'insensitive',
    //       },
    //     },
    //   ];
    // }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.slide.count({ where }),
      pc.slide.findMany({
        where,
        take: take,
        skip: skip,
        orderBy,
        include: {
          topic: true,
          chapter: true,
          slideHasThemes: {
            include: {
              theme: true,
            },
          },
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<SlideDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slide.findUnique({
      where: { id: params.id },
      include: {
        slideHasThemes: {
          include: {
            theme: true,
          },
        },
        topic: true,
        chapter: true,
      },
    });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Slide> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slide.delete({ where: { id: params.id } });
  }

  async deleteManyByTopicId(params: { topicId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slide.deleteMany({ where: { topicId: params.topicId } });
  }

  async deleteManyByChapterId(params: { chapterId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slide.deleteMany({ where: { chapterId: params.chapterId } });
  }
}

export type SlideListRecordType = Prisma.SlideGetPayload<{ include: { topic: true; chapter: true; slideHasThemes: { include: { theme: true } } } }>;
export type SlideDetailRecordType = Prisma.SlideGetPayload<{
  include: {
    slideHasThemes: {
      include: {
        theme: true;
      };
    };
    topic: true;
    chapter: true;
  };
}>;
