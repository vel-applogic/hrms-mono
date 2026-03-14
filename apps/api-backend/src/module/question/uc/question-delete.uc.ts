import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  OperationStatusResponseType,
  QuestionDetailResponseType,
} from '@repo/dto';
import { AuditService, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, QuestionDao, QuestionHasThemeDao } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseQuestionUc } from './_base-question.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class QuestionDeleteUc extends BaseQuestionUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    questionDao: QuestionDao,
    s3Service: S3Service,
    private readonly questionHasThemeDao: QuestionHasThemeDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, questionDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting question', { id: params.id });

    const question = await this.validate(params);

    this.transaction(async (tx) => {
      await this.removeThemes({ questionId: params.id, tx });
      await this.delete({ id: params.id, tx: tx });
    });

    void this.recordActivity(params, question);

    return { success: true, message: 'Question deleted successfully' };
  }

  async validate(params: Params): Promise<QuestionDetailResponseType> {
    return await this.getByIdOrThrow(params.id);
  }

  async delete(params: { id: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.questionDao.delete({ id: params.id, tx: params.tx });
  }

  async removeThemes(params: { questionId: number; tx: Prisma.TransactionClient }): Promise<void> {
    await this.questionHasThemeDao.deleteManyByQuestionId({ questionId: params.questionId, tx: params.tx });
  }

  private async recordActivity(params: Params, deletedQuestion: QuestionDetailResponseType): Promise<void> {
    const relatedEntities = [{ entityType: AuditEntityTypeDtoEnum.question, entityId: deletedQuestion.id }];

    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Question ${deletedQuestion.id} deleted`,
      relatedEntities,
    });
  }
}
