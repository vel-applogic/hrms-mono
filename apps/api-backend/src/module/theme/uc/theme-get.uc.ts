import { Injectable } from '@nestjs/common';
import type { ThemeDetailResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService,ThemeDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { BaseThemeUc } from './_base-theme.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ThemeGetUc extends BaseThemeUc implements IUseCase<Params, ThemeDetailResponseType> {
  constructor(prisma: PrismaService, logger: CommonLoggerService, themeDao: ThemeDao) {
    super(prisma, logger, themeDao);
  }

  async execute(params: Params): Promise<ThemeDetailResponseType> {
    this.logger.i('Getting theme', { id: params.id });

    const theme = await this.validate(params);

    return theme;
  }

  async validate(params: Params): Promise<ThemeDetailResponseType> {
    const theme = await this.getById(params.id);
    if (!theme) {
      throw new ApiError('Theme not found', 404);
    }
    return theme;
  }
}
