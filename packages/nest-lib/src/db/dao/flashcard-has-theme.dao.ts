import { Injectable } from '@nestjs/common';
import type { FlashcardHasTheme, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class FlashcardHasThemeDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.FlashcardHasThemeCreateInput; tx?: Prisma.TransactionClient }): Promise<FlashcardHasTheme> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcardHasTheme.create({ data: params.data });
  }

  async deleteManyByFlashcardId(params: { flashcardId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcardHasTheme.deleteMany({ where: { flashcardId: params.flashcardId } });
  }

  async deleteManyByThemeId(params: { themeId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.flashcardHasTheme.deleteMany({ where: { themeId: params.themeId } });
  }
}
