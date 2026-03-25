import { EmployeeMediaType } from '@repo/db';
import type { EmployeeDetailResponseType, EmployeeListResponseType, MediaResponseType } from '@repo/dto';
import { EmployeeStatusDtoEnum } from '@repo/dto';
import type { EmployeeListRecordType } from '@repo/nest-lib';
import { BaseUc, CommonLoggerService, PrismaService, EmployeeDao, EmployeeHasMediaDao } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import type { S3Service } from '#src/external-service/s3.service.js';

export class BaseEmployeeUc extends BaseUc {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    protected readonly employeeDao: EmployeeDao,
    protected readonly employeeHasMediaDao: EmployeeHasMediaDao,
    protected readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  private async mapMediaRecord(media: { id: number; key: string; name: string; type: string; size: number; ext: string }): Promise<MediaResponseType> {
    const urlFull = await this.s3Service.getSignedUrl(media.key);
    return {
      id: media.id,
      name: media.name,
      key: media.key,
      urlFull,
      type: media.type as MediaResponseType['type'],
      size: media.size,
      ext: media.ext,
    };
  }

  async getById(userId: number): Promise<EmployeeDetailResponseType | undefined> {
    const employee = await this.employeeDao.getByUserId({ userId });
    if (!employee) return undefined;

    const medias = await this.employeeHasMediaDao.findByUserId({ userId });
    const photoRecord = medias.find((m) => m.type === EmployeeMediaType.photo);
    const resumeRecord = medias.find((m) => m.type === EmployeeMediaType.resume);
    const offerLetterRecords = medias.filter((m) => m.type === EmployeeMediaType.offerLetter);
    const otherDocumentsRecords = medias.filter((m) => m.type === EmployeeMediaType.otherDocuments);

    const photo = photoRecord ? await this.mapMediaRecord(photoRecord.media) : undefined;
    const resume = resumeRecord ? await this.mapMediaRecord(resumeRecord.media) : undefined;
    const offerLetters = await Promise.all(offerLetterRecords.map((r) => this.mapMediaRecord(r.media)));
    const otherDocuments = await Promise.all(otherDocumentsRecords.map((r) => this.mapMediaRecord(r.media)));

    return {
      id: employee.userId,
      employeeCode: employee.employeeCode,
      firstname: employee.user.firstname,
      lastname: employee.user.lastname,
      email: employee.user.email,
      personalEmail: employee.personalEmail,
      dob: employee.dob.toISOString().split('T')[0]!,
      pan: employee.pan,
      aadhaar: employee.aadhaar,
      designation: employee.designation,
      dateOfJoining: employee.dateOfJoining.toISOString().split('T')[0]!,
      dateOfLeaving: employee.dateOfLeaving?.toISOString().split('T')[0] ?? undefined,
      status: employee.status as unknown as EmployeeStatusDtoEnum,
      reportToId: employee.reportToId,
      reportTo: employee.reportTo
        ? {
            id: employee.reportTo.id,
            firstname: employee.reportTo.firstname,
            lastname: employee.reportTo.lastname,
            email: employee.reportTo.email,
          }
        : undefined,
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
      photo,
      resume: resume ?? undefined,
      offerLetters: offerLetters.length > 0 ? offerLetters : undefined,
      otherDocuments: otherDocuments.length > 0 ? otherDocuments : undefined,
    };
  }

  async getByIdOrThrow(userId: number): Promise<EmployeeDetailResponseType> {
    const employee = await this.getById(userId);
    if (!employee) throw new ApiError('Employee not found', 404);
    return employee;
  }

  protected dbToEmployeeListResponse(dbRec: EmployeeListRecordType): EmployeeListResponseType {
    return {
      id: dbRec.userId,
      employeeCode: dbRec.employeeCode,
      firstname: dbRec.user.firstname,
      lastname: dbRec.user.lastname,
      email: dbRec.user.email,
      designation: dbRec.designation,
      status: dbRec.status as unknown as EmployeeStatusDtoEnum,
      dateOfJoining: dbRec.dateOfJoining.toISOString().split('T')[0]!,
      dateOfLeaving: dbRec.dateOfLeaving?.toISOString().split('T')[0] ?? null,
      createdAt: dbRec.createdAt.toISOString(),
      updatedAt: dbRec.updatedAt.toISOString(),
    };
  }
}
