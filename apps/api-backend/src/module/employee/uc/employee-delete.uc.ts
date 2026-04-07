import { Injectable } from '@nestjs/common';
import type { EmployeeDetailResponseType, OperationStatusResponseType } from '@repo/dto';
import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from '@repo/dto';
import type { Prisma } from '@repo/db';
import {
  AuditService,
  CommonLoggerService,
  CurrentUserType,
  EmployeeDao,
  EmployeeFeedbackDao,
  EmployeeHasMediaDao,
  IUseCase,
  PayrollCompensationDao,
  PrismaService,
  UserDao,
} from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

import { BaseEmployeeUc } from './_base-employee.uc.js';

type Params = {
  currentUser: CurrentUserType;
  id: number;
};

@Injectable()
export class EmployeeDeleteUc extends BaseEmployeeUc implements IUseCase<Params, OperationStatusResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    employeeDao: EmployeeDao,
    employeeHasMediaDao: EmployeeHasMediaDao,
    s3Service: S3Service,
    private readonly employeeFeedbackDao: EmployeeFeedbackDao,
    private readonly payrollCompensationDao: PayrollCompensationDao,
    private readonly userDao: UserDao,
    private readonly auditService: AuditService,
  ) {
    super(prisma, logger, employeeDao, employeeHasMediaDao, s3Service);
  }

  public async execute(params: Params): Promise<OperationStatusResponseType> {
    this.logger.i('Deleting employee', { id: params.id });
    const employee = await this.validate(params);

    await this.transaction(async (tx) => {
      await this.deleteRelations(params, tx);
      await this.deleteEmployee(params, tx);
      await this.deleteUser(params, tx);
    });

    void this.recordActivity(params, employee);
    return { success: true, message: 'Employee deleted successfully' };
  }

  private async validate(params: Params): Promise<EmployeeDetailResponseType> {
    this.assertAdmin(params.currentUser);
    return await this.getByIdOrThrow(params.id, params.currentUser.organizationId);
  }

  private async deleteRelations(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await tx.employeeFeedback.deleteMany({ where: { userId: params.id } });
    await tx.payrollCompensation.deleteMany({ where: { userId: params.id } });
    await tx.employeeHasMedia.deleteMany({ where: { userId: params.id } });
  }

  private async deleteEmployee(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await tx.employee.delete({ where: { userId_organizationId: { userId: params.id, organizationId: params.currentUser.organizationId } } });
  }

  private async deleteUser(params: Params, tx: Prisma.TransactionClient): Promise<void> {
    await this.userDao.delete({ id: params.id, tx });
  }

  private async recordActivity(params: Params, deleted: EmployeeDetailResponseType): Promise<void> {
    await this.auditService.recordActivity({
      eventGroup: AuditEventGroupDtoEnum.operation,
      eventType: AuditEventTypeDtoEnum.delete,
      status: AuditActivityStatusDtoEnum.success,
      currentUser: params.currentUser,
      description: `Employee ${deleted.firstname} ${deleted.lastname} deleted`,
      relatedEntities: [{ entityType: AuditEntityTypeDtoEnum.employee, entityId: deleted.id }],
    });
  }
}
