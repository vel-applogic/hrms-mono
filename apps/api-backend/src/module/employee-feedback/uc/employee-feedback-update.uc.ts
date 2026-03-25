import { Injectable } from '@nestjs/common';
import type {
  EmployeeFeedbackResponseType,
  EmployeeFeedbackUpdateRequestType,
} from '@repo/dto';
import { EmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeFeedbackUpdateRequestType;
};

@Injectable()
export class EmployeeFeedbackUpdateUc implements IUseCase<Params, EmployeeFeedbackResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeFeedbackDao: EmployeeFeedbackDao,
  ) {}

  async execute(params: Params): Promise<EmployeeFeedbackResponseType> {
    this.logger.i('Updating employee feedback', { id: params.id });

    const existing = await this.employeeFeedbackDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Feedback not found', 404);
    }

    await this.employeeFeedbackDao.update({
      id: params.id,
      data: {
        trend: params.dto.trend as 'positive' | 'negative' | 'neutral',
        point: params.dto.point ?? 0,
        title: params.dto.title,
        feedback: params.dto.feedback,
      },
    });

    const updated = await this.employeeFeedbackDao.getById({ id: params.id });
    if (!updated) throw new ApiError('Failed to fetch updated feedback', 500);

    return {
      id: updated.id,
      employeeId: updated.userId,
      trend: updated.trend as import('@repo/dto').EmployeeFeedbackTrendDtoEnum,
      point: updated.point,
      title: updated.title,
      feedback: updated.feedback,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      givenBy: {
        id: updated.createdBy.id,
        firstname: updated.createdBy.firstname,
        lastname: updated.createdBy.lastname,
        email: updated.createdBy.email,
      },
    };
  }
}
