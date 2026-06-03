import { Injectable } from '@nestjs/common';
import type { OrganisationSettingResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, IUseCase, noOfDaysInMonthDbEnumToDtoEnum, OrganisationSettingDao, PrismaService } from '@repo/nest-lib';

type Params = {
  currentUser: CurrentUserType;
};

@Injectable()
export class OrganisationSettingGetUc extends BaseUc implements IUseCase<Params, OrganisationSettingResponseType | null> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly organisationSettingDao: OrganisationSettingDao,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<OrganisationSettingResponseType | null> {
    this.logger.i('Getting organisation setting', { organisationId: params.currentUser.organisationId });

    const setting = await this.organisationSettingDao.findByOrganisationId({ organisationId: params.currentUser.organisationId });
    if (!setting) {
      return null;
    }

    return {
      id: setting.id,
      noOfDaysInMonth: noOfDaysInMonthDbEnumToDtoEnum(setting.noOfDaysInMonth),
      totalLeaveInDays: setting.totalLeaveInDays,
      sickLeaveInDays: setting.sickLeaveInDays,
      earnedLeaveInDays: setting.earnedLeaveInDays,
      casualLeaveInDays: setting.casualLeaveInDays,
      maternityLeaveInDays: setting.maternityLeaveInDays,
      paternityLeaveInDays: setting.paternityLeaveInDays,
      weeklyOffDays: setting.weeklyOffDays,
      financialYearStartsAt: setting.financialYearStartsAt,
    };
  }
}
