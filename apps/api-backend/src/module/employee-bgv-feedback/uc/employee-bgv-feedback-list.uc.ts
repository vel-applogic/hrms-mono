import { Injectable } from '@nestjs/common';
import type {
  EmployeeBgvFeedbackFilterRequestType,
  EmployeeBgvFeedbackResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeBgvFeedbackDao, EmployeeDao, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';

import { dbToResponse } from './_db-to-response.js';

type Params = {
  currentUser: CurrentUserType;
  filterDto: EmployeeBgvFeedbackFilterRequestType;
};

@Injectable()
export class EmployeeBgvFeedbackListUc implements IUseCase<Params, PaginatedResponseType<EmployeeBgvFeedbackResponseType>> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly employeeBgvFeedbackDao: EmployeeBgvFeedbackDao,
    private readonly s3Service: S3Service,
  ) {}

  async execute(params: Params): Promise<PaginatedResponseType<EmployeeBgvFeedbackResponseType>> {
    this.logger.i('Listing employee BGV feedbacks', { employeeId: params.filterDto.employeeId });

    const employee = await this.employeeDao.getByUserId({ userId: params.filterDto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const { dbRecords, totalRecords } = await this.employeeBgvFeedbackDao.findByUserIdWithPagination({
      userId: params.filterDto.employeeId,
      organizationId: params.currentUser.organizationId,
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
    });

    const results = await Promise.all(dbRecords.map((r) => dbToResponse(r, this.s3Service)));

    return {
      page: params.filterDto.pagination.page,
      limit: params.filterDto.pagination.limit,
      totalRecords,
      results,
    };
  }
}
