import { Injectable } from '@nestjs/common';
import type { Flashcard, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';
import { FlashcardFilterRequestType } from '@repo/dto';

@Injectable()
export class FlashcardDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.FlashcardCreateInput; tx?: Prisma.TransactionClient }): Promise<Flashcard> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcard.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.FlashcardUpdateInput; tx?: Prisma.TransactionClient }): Promise<Flashcard> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcard.update({ where: { id: params.id }, data: params.data });
  }

  public async search(params: {
    filterDto: FlashcardFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: FlashcardListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.FlashcardWhereInput = {};

    if (params.filterDto.chapterId) {
      where.chapterId = params.filterDto.chapterId;
    }

    if (params.filterDto.topicId) {
      where.topicId = params.filterDto.topicId;
    }

    if (params.filterDto.themeIds && params.filterDto.themeIds.length > 0) {
      where.flashcardHasThemes = {
        some: {
          themeId: { in: params.filterDto.themeIds },
        },
      };
    }

    if (params.filterDto.search) {
      where.OR = [
        {
          contentFront: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
        {
          contentBack: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.flashcard.count({ where }),
      pc.flashcard.findMany({
        where,
        take: take,
        skip: skip,
        orderBy,
        include: {
          topic: true,
          chapter: true,
          flashcardHasThemes: {
            include: {
              theme: true,
            },
          },
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<FlashcardDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcard.findUnique({
      where: { id: params.id },
      include: {
        flashcardHasThemes: {
          include: {
            theme: true,
          },
        },
      },
    });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Flashcard> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcard.delete({ where: { id: params.id } });
  }

  async deleteManyByTopicId(params: { topicId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcard.deleteMany({ where: { topicId: params.topicId } });
  }

  async deleteManyByChapterId(params: { chapterId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcard.deleteMany({ where: { chapterId: params.chapterId } });
  }
}

export type FlashcardListRecordType = Prisma.FlashcardGetPayload<{
  include: {
    topic: true;
    chapter: true;
    flashcardHasThemes: {
      include: {
        theme: true;
      };
    };
  };
}>;
type FlashcardDetailRecordType = Prisma.FlashcardGetPayload<{
  include: {
    flashcardHasThemes: {
      include: {
        theme: true;
      };
    };
  };
}>;
