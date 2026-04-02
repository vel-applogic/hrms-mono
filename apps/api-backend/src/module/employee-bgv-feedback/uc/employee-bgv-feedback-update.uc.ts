import { Injectable } from '@nestjs/common';
import type { EmployeeBgvFeedbackResponseType, EmployeeBgvFeedbackUpdateRequestType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeBgvFeedbackDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { dbToResponse } from './_db-to-response.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeBgvFeedbackUpdateRequestType;
};

@Injectable()
export class EmployeeBgvFeedbackUpdateUc implements IUseCase<Params, EmployeeBgvFeedbackResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeBgvFeedbackDao: EmployeeBgvFeedbackDao,
    private readonly s3Service: S3Service,
  ) {}

  async execute(params: Params): Promise<EmployeeBgvFeedbackResponseType> {
    this.logger.i('Updating employee BGV feedback', { id: params.id });

    const existing = await this.employeeBgvFeedbackDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('BGV feedback not found', 404);
    }

    await this.prisma.$transaction(async (tx) => {
      await this.employeeBgvFeedbackDao.update({
        id: params.id,
        organizationId: params.currentUser.organizationId,
        data: {
          feedback: params.dto.feedback,
        },
        tx,
      });
    });

    const updated = await this.employeeBgvFeedbackDao.getByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId });
    return dbToResponse(updated, this.s3Service);
  }
}
