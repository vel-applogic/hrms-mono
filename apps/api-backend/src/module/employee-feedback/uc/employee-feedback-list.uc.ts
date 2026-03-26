import { Injectable } from '@nestjs/common';
import type {
  EmployeeFeedbackFilterRequestType,
  EmployeeFeedbackResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { EmployeeDao, EmployeeFeedbackDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  filterDto: EmployeeFeedbackFilterRequestType;
};

@Injectable()
export class EmployeeFeedbackListUc implements IUseCase<Params, PaginatedResponseType<EmployeeFeedbackResponseType>> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly employeeFeedbackDao: EmployeeFeedbackDao,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<EmployeeFeedbackResponseType>> {
    this.logger.i('Listing employee feedbacks', { employeeId: params.filterDto.employeeId });

    const employee = await this.employeeDao.getByUserId({ userId: params.filterDto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const { dbRecords, totalRecords } = await this.employeeFeedbackDao.findByUserIdWithPagination({
      userId: params.filterDto.employeeId,
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results = dbRecords.map((f) => ({
      id: f.id,
      employeeId: f.userId,
      trend: f.trend as import('@repo/dto').EmployeeFeedbackTrendDtoEnum,
      point: f.point,
      title: f.title,
      feedback: f.feedback,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
      givenBy: {
        id: f.createdBy.id,
        firstname: f.createdBy.firstname,
        lastname: f.createdBy.lastname,
        email: f.createdBy.email,
      },
    }));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
