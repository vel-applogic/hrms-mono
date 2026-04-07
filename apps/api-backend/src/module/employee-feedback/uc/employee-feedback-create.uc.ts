import { Injectable } from '@nestjs/common';
import type {
  EmployeeFeedbackCreateRequestType,
  EmployeeFeedbackResponseType,
} from '@repo/dto';
import { BaseUc, EmployeeDao, EmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeFeedbackCreateRequestType;
};

@Injectable()
export class EmployeeFeedbackCreateUc extends BaseUc implements IUseCase<Params, EmployeeFeedbackResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly employeeFeedbackDao: EmployeeFeedbackDao,
  ) {
    super(prisma, logger);
  }

  async execute(params: Params): Promise<EmployeeFeedbackResponseType> {
    this.assertAdmin(params.currentUser);
    this.logger.i('Creating employee feedback', { employeeId: params.dto.employeeId });

    const employee = await this.employeeDao.getByUserId({ userId: params.dto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const createdId = await this.prisma.$transaction(async (tx) => {
      return await this.employeeFeedbackDao.create({
        data: {
          user: { connect: { id: params.dto.employeeId } },
          organization: { connect: { id: params.currentUser.organizationId } },
          createdBy: { connect: { id: params.currentUser.id } },
          trend: params.dto.trend,
          point: params.dto.point ?? 0,
          title: params.dto.title,
          feedback: params.dto.feedback,
        },
        tx,
      });
    });

    const withUser = await this.employeeFeedbackDao.getByIdOrThrow({ id: createdId, organizationId: params.currentUser.organizationId });

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
