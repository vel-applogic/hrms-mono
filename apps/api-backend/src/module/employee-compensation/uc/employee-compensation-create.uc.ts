import { Injectable } from '@nestjs/common';
import type { EmployeeCompensationCreateRequestType, EmployeeCompensationResponseType } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, IUseCase, PrismaService, UserEmployeeCompensationDao, UserEmployeeDetailDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeCompensationCreateRequestType;
};

@Injectable()
export class EmployeeCompensationCreateUc implements IUseCase<Params, EmployeeCompensationResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeDetailDao: UserEmployeeDetailDao,
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
  ) {}

  async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Creating employee compensation', { employeeId: params.dto.employeeId });

    const employee = await this.userEmployeeDetailDao.getByUserId({ userId: params.dto.employeeId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      await this.userEmployeeCompensationDao.updateManyByUserId({
        userId: params.dto.employeeId,
        data: { isActive: false },
        tx,
      });
      return this.userEmployeeCompensationDao.create({
        data: {
          user: { connect: { id: params.dto.employeeId } },
          basic: params.dto.basic,
          hra: params.dto.hra,
          otherAllowances: params.dto.otherAllowances,
          gross: params.dto.gross,
          effectiveFrom: params.dto.effectiveFrom ? new Date(params.dto.effectiveFrom) : undefined,
          effectiveTill: params.dto.effectiveTill ? new Date(params.dto.effectiveTill) : undefined,
          isActive: true,
        },
        tx,
      });
    });

    return {
      id: created.id,
      employeeId: created.userId,
      basic: created.basic,
      hra: created.hra,
      otherAllowances: created.otherAllowances,
      gross: created.gross,
      effectiveFrom: created.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: created.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: created.isActive,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
