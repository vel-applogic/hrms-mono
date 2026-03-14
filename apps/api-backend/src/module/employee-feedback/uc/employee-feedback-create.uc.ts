import { Injectable } from '@nestjs/common';
import type {
  EmployeeFeedbackCreateRequestType,
  EmployeeFeedbackResponseType,
} from '@repo/dto';
import { UserEmployeeDetailDao, UserEmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeFeedbackCreateRequestType;
};

@Injectable()
export class EmployeeFeedbackCreateUc implements IUseCase<Params, EmployeeFeedbackResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly userEmployeeFeedbackDao: UserEmployeeFeedbackDao,
  ) {}

  async execute(params: Params): Promise<EmployeeFeedbackResponseType> {
    this.logger.i('Creating employee feedback', { employeeId: params.dto.employeeId });

    const employee = await this.userEmployeeDetailDao.getByUserId({ userId: params.dto.employeeId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const created = await this.userEmployeeFeedbackDao.create({
      data: {
        user: { connect: { id: params.dto.employeeId } },
        createdBy: { connect: { id: params.currentUser.id } },
        trend: params.dto.trend as 'positive' | 'negative' | 'neutral',
        point: params.dto.point ?? 0,
        title: params.dto.title,
        feedback: params.dto.feedback,
      },
    });

    const withUser = await this.userEmployeeFeedbackDao.getById({ id: created.id });
    if (!withUser) throw new ApiError('Failed to fetch created feedback', 500);

    return {
      id: withUser.id,
      employeeId: withUser.userId,
      trend: withUser.trend as import('@repo/dto').EmployeeFeedbackTrendDtoEnum,
      point: withUser.point,
      title: withUser.title,
      feedback: withUser.feedback,
      createdAt: withUser.createdAt.toISOString(),
      updatedAt: withUser.updatedAt.toISOString(),
      givenBy: {
        id: withUser.createdBy.id,
        firstname: withUser.createdBy.firstname,
        lastname: withUser.createdBy.lastname,
        email: withUser.createdBy.email,
      },
    };
  }
}
