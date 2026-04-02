import { Injectable } from '@nestjs/common';
import { EmployeeMediaType } from '@repo/db';
import type { EmployeeDetailResponseType, EmployeeUpdateRequestType, MediaUpsertType, OperationStatusResponseType } from '@repo/dto';
import {
  AuditActivityStatusDtoEnum,
  AuditEntityTypeDtoEnum,
  AuditEventGroupDtoEnum,
  AuditEventTypeDtoEnum,
  MediaTypeDtoEnum,
} from '@repo/dto';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  IUseCase,
  MediaDao,
  PrismaService,
  UserDao,
  EmployeeDao,
  EmployeeHasMediaDao,
} from '@repo/nest-lib';
import { ApiFieldValidationError } from '@repo/shared';
import type { Prisma } from '@repo/db';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
  dto: EmployeeUpdateRequestType;
};

@Injectable()
export class EmployeeUpdateUc extends BaseEmployeeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    employeeDao: EmployeeDao,
    employeeHasMediaDao: EmployeeHasMediaDao,
    s3Service: S3Service,
    private readonly userDao: UserDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, employeeDao, employeeHasMediaDao, s3Service);
  }

  async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Updating employee', { id: params.id });

    const oldEmployee = await this.getByIdOrThrow(params.id, params.currentUser.organizationId);

    const duplicateCode = await this.employeeDao.findByEmployeeCode({ employeeCode: params.dto.employeeCode, organizationId: params.currentUser.organizationId, excludeUserId: params.id });
    if (duplicateCode) throw new ApiFieldValidationError('employeeCode', 'Employee code already exists in this organisation');

    if (params.dto.pan) {
      const duplicatePan = await this.employeeDao.findByPan({ pan: params.dto.pan, organizationId: params.currentUser.organizationId, excludeUserId: params.id });
      if (duplicatePan) throw new ApiFieldValidationError('pan', 'PAN already registered in this organisation');
    }
    if (params.dto.aadhaar) {
      const duplicateAadhaar = await this.employeeDao.findByAadhaar({ aadhaar: params.dto.aadhaar, organizationId: params.currentUser.organizationId, excludeUserId: params.id });
      if (duplicateAadhaar) throw new ApiFieldValidationError('aadhaar', 'Aadhaar already registered in this organisation');
    }

    await this.transaction(async (tx) => {
      await this.userDao.update({
        id: params.id,
        data: {
          firstname: params.dto.firstname,
          lastname: params.dto.lastname,
          email: params.dto.email,
        },
        tx,
      });

      await this.employeeDao.update({
        userId: params.id,
        organizationId: params.currentUser.organizationId,
        data: {
          employeeCode: params.dto.employeeCode,
          personalEmail: params.dto.personalEmail ?? undefined,
          dob: new Date(params.dto.dob),
          pan: params.dto.pan ?? undefined,
          aadhaar: params.dto.aadhaar ?? undefined,
          designation: params.dto.designation,
          dateOfJoining: new Date(params.dto.dateOfJoining),
          dateOfLeaving: params.dto.dateOfLeaving ? new Date(params.dto.dateOfLeaving) : undefined,
          status: params.dto.status,
          reportTo: params.dto.reportToId ? { connect: { id: params.dto.reportToId } } : { disconnect: true },
          isBgVerified: params.dto.isBgVerified ?? false,
        },
        tx,
      });

      if (params.dto.photo !== undefined) {
        await this.employeeHasMediaDao.deleteManyByUserIdAndType({
          userId: params.id,
          type: EmployeeMediaType.photo,
          tx,
        });
        if (params.dto.photo?.key?.startsWith('temp/')) {
          await this.createAndLinkMedia({ media: params.dto.photo, userId: params.id, organizationId: params.currentUser.organizationId, type: EmployeeMediaType.photo, tx });
        } else if (params.dto.photo?.id) {
          await this.employeeHasMediaDao.create({
            data: { userId: params.id, mediaId: params.dto.photo.id, type: EmployeeMediaType.photo },
            tx,
          });
        }
      }
    });

    const newEmployee = await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
    void this.recordActivity(params, oldEmployee, newEmployee);
    return { success: true, message: 'Employee updated successfully' };
  }

  private async createAndLinkMedia(params: {
    media: MediaUpsertType;
    userId: number;
    organizationId: number;
    type: EmployeeMediaType;
    tx: Prisma.TransactionClient;
  }): Promise<void> {
    const file = await this.mediaService.moveTempFileAndGetKey({
      media: params.media,
      mediaPlacement: 'employee',
      relationId: params.userId,
      isImage: params.media.type === MediaTypeDtoEnum.image,
    });
    if (!file) return;

    const mediaId = await this.mediaDao.create({
      data: { key: file.newKey, name: params.media.name, type: params.media.type, size: file.size, ext: file.ext, organization: { connect: { id: params.organizationId } } },
      tx: params.tx,
    });

    await this.employeeHasMediaDao.create({
      data: { userId: params.userId, mediaId, type: params.type },
      tx: params.tx,
    });
  }

  private async recordActivity(
    params: Params,
    oldEmployee: EmployeeDetailResponseType,
    newEmployee: EmployeeDetailResponseType,
  ): Promise<void> {
    const changes = this.computeChanges({
      oldValues: { firstname: oldEmployee.firstname, lastname: oldEmployee.lastname, status: oldEmployee.status },
      newValues: { firstname: newEmployee.firstname, lastname: newEmployee.lastname, status: newEmployee.status },
    });
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.update,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: 'Employee updated',
      data: { changes },
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.employee, entityId: newEmployee.id }],
    });
  }
}
