import { Injectable } from '@nestjs/common';
import type { SlideHasTheme, Prisma } from '@repo/db';

import { PrismaService } from '../prisma/prisma.service.js';
import { BaseDao } from './_base.dao.js';

@Injectable()
export class SlideHasThemeDao extends BaseDao {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(params: { data: Prisma.SlideHasThemeCreateInput; tx?: Prisma.TransactionClient }): Promise<SlideHasTheme> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slideHasTheme.create({ data: params.data });
  }

  async deleteManyBySlideId(params: { slideId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slideHasTheme.deleteMany({ where: { slideId: params.slideId } });
  }

  async deleteManyByThemeId(params: { themeId: number; tx?: Prisma.TransactionClient }): Promise<{ count: number }> {
    const pc = this.getPrismaClient(params.tx);
    return pc.slideHasTheme.deleteMany({ where: { themeId: params.themeId } });
  }
}
