import { Injectable } from '@nestjs/common';
import type {
  EmployeeFeedbackResponseType,
  EmployeeFeedbackUpdateRequestType,
} from '@repo/dto';
import { BaseUc, EmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeFeedbackUpdateRequestType;
};

@Injectable()
export class EmployeeFeedbackUpdateUc extends BaseUc implements IUseCase<Params, EmployeeFeedbackResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly employeeFeedbackDao: EmployeeFeedbackDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<EmployeeFeedbackResponseType> {
    this.assertAdmin(params.currentUser);
    this.logger.i('Updating employee feedback', { id: params.id });
    await this.validate(params);
    return await this.update(params);
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.employeeFeedbackDao.getById({ id: params.id, organizationId: params.currentUser.organizationId });
    if (!existing) {
      throw new ApiError('Feedback not found', 404);
    }
  }

  private async update(params: Params): Promise<EmployeeFeedbackResponseType> {
    await this.prisma.$transaction(async (tx) => {
      await this.employeeFeedbackDao.update({
        id: params.id,
        organizationId: params.currentUser.organizationId,
        data: {
          trend: params.dto.trend,
          point: params.dto.point ?? 0,
          title: params.dto.title,
          feedback: params.dto.feedback,
        },
        tx,
      });
    });

    const updated = await this.employeeFeedbackDao.getByIdOrThrow({ id: params.id, organizationId: params.currentUser.organizationId });

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
