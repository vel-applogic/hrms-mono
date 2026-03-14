import { Injectable } from '@nestjs/common';
import type { Prisma, Question } from '@repo/db';

import { QuestionFilterRequestType } from '@repo/dto';
import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao, OrderByParam } from './_base.dao.js';

@Injectable()
export class QuestionDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.QuestionCreateInput; tx?: Prisma.TransactionClient }): Promise<Question> {
    const pc = this.getPrismaClient(params.tx);
    return pc.question.create({ data: params.data });
  }

  async update(params: { id: number; data: Prisma.QuestionUpdateInput; tx?: Prisma.TransactionClient }): Promise<Question> {
    const pc = this.getPrismaClient(params.tx);
    return pc.question.update({ where: { id: params.id }, data: params.data });
  }

  public async search(params: {
    filterDto: QuestionFilterRequestType;
    orderBy?: OrderByParam;
    tx?: Prisma.TransactionClient;
  }): Promise<{ totalRecords: number; dbRecords: QuestionListRecordType[] }> {
    const pc = this.getPrismaClient(params.tx);
    const pagination = {
      pageNo: params.filterDto.pagination.page,
      pageSize: params.filterDto.pagination.limit,
    };
    const { take, skip } = this.getPagination(pagination);

    const where: Prisma.QuestionWhereInput = {};

    if (params.filterDto.chapterId) {
      where.chapterId = params.filterDto.chapterId;
    }

    if (params.filterDto.topicId) {
      where.topicId = params.filterDto.topicId;
    }

    if (params.filterDto.themeIds && params.filterDto.themeIds.length > 0) {
      where.questionHasThemes = {
        some: {
          themeId: { in: params.filterDto.themeIds },
        },
      };
    }

    if (params.filterDto.search) {
      where.OR = [
        {
          question: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
        {
          explanation: {
            contains: params.filterDto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const orderBy = params.orderBy;

    const [totalRecords, dbRecords] = await Promise.all([
      pc.question.count({ where }),
      pc.question.findMany({
        where,
        take: take,
        skip: skip,
        orderBy,
        include: {
          questionHasThemes: {
            include: {
              theme: true,
            },
          },
          topic: true,
          chapter: true,
        },
      }),
    ]);

    return { dbRecords, totalRecords };
  }

  async getById(params: { id: number; tx?: Prisma.TransactionClient }): Promise<QuestionDetailRecordType | null> {
    const pc = this.getPrismaClient(params.tx);
    return pc.question.findUnique({
      where: { id: params.id },
      include: {
        media: true,
        questionHasThemes: {
          include: {
            theme: true,
          },
        },
        topic: true,
        chapter: true,
      },
    });
  }

  async delete(params: { id: number; tx?: Prisma.TransactionClient }): Promise<Question> {
    const pc = this.getPrismaClient(params.tx);
    return pc.question.delete({ where: { id: params.id } });
  }

  async deleteManyByTopicId(params: { topicId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.question.deleteMany({ where: { topicId: params.topicId } });
  }

  async deleteManyByChapterId(params: { chapterId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.question.deleteMany({ where: { chapterId: params.chapterId } });
  }
}

export type QuestionListRecordType = Prisma.QuestionGetPayload<{ include: { questionHasThemes: { include: { theme: true } }; topic: true; chapter: true } }>;
export type QuestionDetailRecordType = Prisma.QuestionGetPayload<{
  include: {
    media: true;
    questionHasThemes: {
      include: {
        theme: true;
      };
    };
    topic: true;
    chapter: true;
  };
}>;
export type QuestionAnswerOptionRecordType = {
  options: {
    key: string;
    value: string;
  }[];
};
