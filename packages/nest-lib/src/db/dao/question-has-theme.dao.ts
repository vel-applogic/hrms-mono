import { Injectable } from '@nestjs/common';
import type { Prisma, QuestionHasTheme } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class QuestionHasThemeDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.QuestionHasThemeCreateInput; tx?: Prisma.TransactionClient }): Promise<QuestionHasTheme> {
    const pc = this.getPrismaClient(params.tx);
    return pc.questionHasTheme.create({ data: params.data });
  }

  async deleteManyByQuestionId(params: { questionId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.questionHasTheme.deleteMany({ where: { questionId: params.questionId } });
  }

  async deleteManyByThemeId(params: { themeId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.questionHasTheme.deleteMany({ where: { themeId: params.themeId } });
  }
}
