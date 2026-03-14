import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  OperationStatusResponseType,
  ThemeDetailResponseType,
  ThemeUpdateRequestType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, ThemeDao } from '@repo/nest-lib';

import { BaseThemeUc } from './_base-theme.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: ThemeUpdateRequestType;
};

@Injectable()
export class ThemeUpdateUc extends BaseThemeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    themeDao: ThemeDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, themeDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating theme', { id: params.id });

    const oldTheme = await this.validate(params);
    await this.transaction(async (_tx) => {
      await this.update(params.id, params.dto);
    });
    const newTheme = await this.getByIdOrThrow(params.id);
    void this.recordActivity(params, oldTheme, newTheme);

    return { success: true, message: 'Theme updated successfully' };
  }

  async validate(params: Params): Promise<ThemeDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async update(id: number, dto: ThemeUpdateRequestType): Promise<void> {
    const updateData: Prisma.ThemeUpdateInput = {
      updatedAt: new Date(),
      title: dto.title,
      description: dto.description,
    };
    await this.themeDao.update({ id: id, data: updateData });
  }

  private async recordActivity(params: Params, oldTheme: ThemeDetailResponseType, newTheme: ThemeDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {
        title: oldTheme.title,
        description: oldTheme.description,
      },
      newValues: {
        title: newTheme.title,
        description: newTheme.description,
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.theme, entityId: newTheme.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Theme updated',
      data: { changes },
      relatedEntities,
    });
  }
}
