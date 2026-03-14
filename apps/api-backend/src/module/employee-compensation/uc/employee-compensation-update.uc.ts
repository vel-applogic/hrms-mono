import { Injectable } from '@nestjs/common';
import type {
  EmployeeCompensationResponseType,
  EmployeeCompensationUpdateRequestType,
} from '@repo/dto';
import { UserEmployeeCompensationDao, CommonLoggerService, CurrentUserType, IUseCase, PrismaService } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeCompensationUpdateRequestType;
};

@Injectable()
export class EmployeeCompensationUpdateUc implements IUseCase<Params, EmployeeCompensationResponseType> {
  constructor(
    prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly userEmployeeCompensationDao: UserEmployeeCompensationDao,
  ) {}

  async execute(params: Params): Promise<EmployeeCompensationResponseType> {
    this.logger.i('Updating employee compensation', { id: params.id });

    const existing = await this.userEmployeeCompensationDao.getById({ id: params.id });
    if (!existing) {
      throw new ApiError('Compensation not found', 404);
    }

    await this.userEmployeeCompensationDao.update({
      id: params.id,
      data: {
        basic: params.dto.basic,
        hra: params.dto.hra,
        otherAllowances: params.dto.otherAllowances,
        gross: params.dto.gross,
        effectiveFrom: params.dto.effectiveFrom ? new Date(params.dto.effectiveFrom) : undefined,
        effectiveTill: params.dto.effectiveTill ? new Date(params.dto.effectiveTill) : undefined,
        isActive: params.dto.isActive,
      },
    });

    const updated = await this.userEmployeeCompensationDao.getById({ id: params.id });
    if (!updated) throw new ApiError('Failed to fetch updated compensation', 500);

    return {
      id: updated.id,
      employeeId: updated.userId,
      basic: updated.basic,
      hra: updated.hra,
      otherAllowances: updated.otherAllowances,
      gross: updated.gross,
      effectiveFrom: updated.effectiveFrom.toISOString().split('T')[0]!,
      effectiveTill: updated.effectiveTill?.toISOString().split('T')[0] ?? undefined,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
