import { Injectable } from '@nestjs/common';
import type { Prisma } from '@repo/db';
import { EmployeeMediaType, UserRoleDbEnum } from '@repo/db';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  EmployeeCreateRequestType,
  MediaTypeDtoEnum,
  MediaUpsertType,
  OperationStatusResponseType,
} from '@repo/dto';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  LeaveConfigDao,
  MediaDao,
  PrismaService,
  UserDao,
  UserEmployeeDetailDao,
  UserEmployeeHasMediaDao,
  UserEmployeeLeaveCounterDao,
} from '@repo/nest-lib';
import { ApiFieldValidationError, getFinancialYearCode } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';
import { PasswordService } from '#src/service/password.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeCreateRequestType;
};

@Injectable()
export class EmployeeCreateUc extends BaseEmployeeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    userEmployeeDetailDao: UserEmployeeDetailDao,
    userEmployeeHasMediaDao: UserEmployeeHasMediaDao,
    s3Service: S3Service,
    private readonly userDao: UserDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly passwordService: PasswordService,
    private readonly auditService: AuditService,
    private readonly leaveConfigDao: LeaveConfigDao,
    private readonly userEmployeeLeaveCounterDao: UserEmployeeLeaveCounterDao,
  ) {
    super(prisma, logger, userEmployeeDetailDao, userEmployeeHasMediaDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Creating employee', { email: params.dto.email });

    await this.validate(params);

    const userId = await this.transaction(async (tx) => {
      const hashedPassword = await this.passwordService.hash(params.dto.password);
      const user = await this.userDao.create({
        data: {
          email: params.dto.email,
          firstname: params.dto.firstname,
          lastname: params.dto.lastname,
          password: hashedPassword,
          isActive: true,
        },
        tx,
      });

      const dateOfJoining = new Date(params.dto.dateOfJoining);
      await this.userEmployeeDetailDao.create({
        data: {
          user: { connect: { id: user.id } },
          personalEmail: params.dto.personalEmail ?? undefined,
          dob: new Date(params.dto.dob),
          pan: params.dto.pan,
          aadhaar: params.dto.aadhaar,
          designation: params.dto.designation,
          dateOfJoining,
          dateOfLeaving: params.dto.dateOfLeaving ? new Date(params.dto.dateOfLeaving) : undefined,
          status: params.dto.status,
          reportTo: params.dto.reportToId ? { connect: { id: params.dto.reportToId } } : undefined,
        },
        tx,
      });

      const financialYear = getFinancialYearCode(dateOfJoining);
      const leaveConfig = await this.leaveConfigDao.getLatest({ tx });
      const totalLeavesAvailable = leaveConfig?.maxLeaves ?? 24;
      await this.userEmployeeLeaveCounterDao.create({
        data: {
          user: { connect: { id: user.id } },
          financialYear,
          casualLeaves: 0,
          sickLeaves: 0,
          earnedLeaves: 0,
          totalLeavesUsed: 0,
          totalLeavesAvailable,
        },
        tx,
      });

      if (params.dto.photo?.key?.startsWith('temp/')) {
        await this.createAndLinkMedia({ media: params.dto.photo, userId: user.id, type: EmployeeMediaType.photo, tx });
      }

      return user.id;
    });

    const employee = await this.getByIdOrThrow(userId);
    void this.recordActivity(params, employee);
    return { success: true, message: 'Employee created successfully' };
  }

  private async validate(params: Params): Promise<void> {
    const existing = await this.userDao.getByEmail({ email: params.dto.email });
    if (existing) {
      throw new ApiFieldValidationError('email', 'User with this email already exists');
    }
  }

  private async createAndLinkMedia(params: { media: MediaUpsertType; userId: number; type: EmployeeMediaType; tx: Prisma.TransactionClient }): Promise<void> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'employee',
      relationId: params.userId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: { key: file.newKey, name: params.media.name, type: params.media.type, size: file.size, ext: file.ext },
      tx: params.tx,
    });

    await this.userEmployeeHasMediaDao.create({
      data: { userId: params.userId, mediaId, type: params.type },
      tx: params.tx,
    });
  }

  private async recordActivity(params: Params, created: Awaited<ReturnType<BaseEmployeeUc['getById']>>): Promise<void> {
    if (!created) return;
    const changes = this.computeChanges({
      oldValues: {},
      newValues: { firstname: created.firstname, lastname: created.lastname, email: created.email },
    });
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.create,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Employee created',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.employee, entityId: created.id }],
    });
  }
}
