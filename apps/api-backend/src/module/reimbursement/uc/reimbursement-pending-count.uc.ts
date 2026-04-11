import { Injectable } from '@nestjs/common';
import type { CountResponseType } from '@repo/dto';
import { UserRoleDtoEnum } from '@repo/dto';
import {
  BaseUc,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  PrismaService,
  ReimbursementDao,
  reimbursementStatusDtoEnumToDbEnum,
} from '@repo/nest-lib';
import { ReimbursementStatusDtoEnum } from '@repo/dto';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class ReimbursementPendingCountUc extends BaseUc implements IUseCase<Params, CountResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly reimbursementDao: ReimbursementDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<CountResponseType> {
    this.logger.i('Counting pending reimbursements');

    const isAdmin = params.currentUser.isSuperAdmin || params.currentUser.roles.includes(UserRoleDtoEnum.admin);

    const count = await this.reimbursementDao.count({
      organizationId: params.currentUser.organizationId,
      userId: isAdmin ? undefined : params.currentUser.id,
      where: {
        status: reimbursementStatusDtoEnumToDbEnum(ReimbursementStatusDtoEnum.pending),
      },
    });

    return { count };
  }
}
