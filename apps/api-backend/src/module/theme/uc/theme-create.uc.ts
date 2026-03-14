import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  OperationStatusResponseType,
  ThemeCreateRequestType,
  ThemeDetailResponseType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, ThemeDao } from '@repo/nest-lib';

import { BaseThemeUc } from './_base-theme.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: ThemeCreateRequestType;
};

@Injectable()
export class ThemeCreateUc extends BaseThemeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    logger: CommonLoggerService,
    themeDao: ThemeDao,
    prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, themeDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating theme', { title: params.dto.title });

    await this.validate(params);
    const createdId = await this.transaction(async (tx) => {
      const theme = await this.create({ dto: params.dto, tx });
      return theme.id;
    });
    const theme = await this.getByIdOrThrow(createdId);
    void this.recordActivity(params, theme);
    return { success: true, message: 'Theme created successfully' };
  }

  async validate(_params: Params): Promise<void> {}

  async create(params: { dto: ThemeCreateRequestType; tx: Prisma.TransactionClient }): Promise<ThemeDetailResponseType> {
    const theme = await this.themeDao.create({
      data: {
        title: params.dto.title,
        description: params.dto.description,
      },
    });

    return {
      id: theme.id,
      title: theme.title,
      description: theme.description || undefined,
      createdAt: theme.createdAt.toISOString(),
      updatedAt: theme.updatedAt.toISOString(),
    };
  }

  private async recordActivity(params: Params, createdTheme: ThemeDetailResponseType): Promise<void> {
    const changes = this.computeChanges({
      oldValues: {},
      newValues: {
        title: createdTheme.title,
        description: createdTheme.description,
      },
    });

    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.theme, entityId: createdTheme.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Theme created',
      data: { changes },
      relatedEntities,
    });
  }
}
