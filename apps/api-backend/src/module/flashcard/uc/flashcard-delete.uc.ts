import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  FlashcardDetailResponseType,
  OperationStatusResponseType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, FlashcardDao, FlashcardHasThemeDao, IUseCase, PrismaService } from '@repo/nest-lib';

import { BaseFlashcardUc } from './_base-flashcard.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class FlashcardDeleteUc extends BaseFlashcardUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    flashcardDao: FlashcardDao,
    private readonly flashcardHasThemeDao: FlashcardHasThemeDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, flashcardDao);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting flashcard', { id: params.id });

    const flashcard = await this.validate(params);

    this.transaction(async (tx) => {
      await this.removeLinkedThemes({ flashcardId: params.id, tx });
      await this.delete({ id: params.id, tx });
    });
    void this.recordActivity(params, flashcard);

    return { success: true, message: 'Flashcard deleted successfully' };
  }

  async validate(params: Params): Promise<FlashcardDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async removeLinkedThemes(params: { flashcardId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.flashcardHasThemeDao.deleteManyByFlashcardId({ flashcardId: params.flashcardId, tx: params.tx });
  }

  async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.flashcardDao.delete({ id: params.id, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedFlashcard: FlashcardDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.flashcard, entityId: deletedFlashcard.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Flashcard ${deletedFlashcard.id} deleted`,
      relatedEntities,
    });
  }
}
