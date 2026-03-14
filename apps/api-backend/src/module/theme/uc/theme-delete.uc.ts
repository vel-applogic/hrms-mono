import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum, OperationStatusResponseType, ThemeDetailResponseType } from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, FlashcardHasThemeDao, IUseCase, PrismaService, QuestionHasThemeDao, SlideHasThemeDao, ThemeDao } from '@repo/nest-lib';

import { BaseThemeUc } from './_base-theme.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class ThemeDeleteUc extends BaseThemeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    themeDao: ThemeDao,
    private readonly slideHasThemeDao: SlideHasThemeDao,
    private readonly flashcardHasThemeDao: FlashcardHasThemeDao,
    private readonly questionHasThemeDao: QuestionHasThemeDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, themeDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting theme', { id: params.id });

    const theme = await this.validate(params);

    this.transaction(async (tx) => {
      await this.delete({ id: params.id, tx: tx });
    });
    void this.recordActivity(params, theme);

    return { success: true, message: 'Theme deleted successfully' };
  }

  async validate(params: Params): Promise<ThemeDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    // delete links on slide, flashcard, question
    await this.slideHasThemeDao.deleteManyByThemeId({ themeId: params.id, tx: params.tx });
    await this.flashcardHasThemeDao.deleteManyByThemeId({ themeId: params.id, tx: params.tx });
    await this.questionHasThemeDao.deleteManyByThemeId({ themeId: params.id, tx: params.tx });
    await this.themeDao.delete({ id: params.id, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedTheme: ThemeDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.theme, entityId: deletedTheme.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Theme ${deletedTheme.title} deleted`,
      relatedEntities,
    });
  }
}
