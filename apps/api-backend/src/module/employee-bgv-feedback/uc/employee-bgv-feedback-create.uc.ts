import { Injectable } from '@nestjs/common';
import type { EmployeeBgvFeedbackCreateRequestType, EmployeeBgvFeedbackResponseType } from '@repo/dto';
import { MediaTypeDtoEnum } from '@repo/dto';
import { CommonLoggerService, CurrentUserType, EmployeeBgvFeedbackDao, EmployeeDao, IUseCase, MediaDao, PrismaService } from '@repo/nest-lib';
import { mediaTypeDtoEnumToDbEnum } from '@repo/nest-lib';
import { ApiError } from '@repo/shared';

import { S3Service } from '#src/external-service/s3.service.js';
import { MediaService } from '#src/service/media.service.js';

import { dbToResponse } from './_db-to-response.js';

type Params = {
  currentUser: CurrentUserType;
  dto: EmployeeBgvFeedbackCreateRequestType;
};

@Injectable()
export class EmployeeBgvFeedbackCreateUc implements IUseCase<Params, EmployeeBgvFeedbackResponseType> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CommonLoggerService,
    private readonly employeeDao: EmployeeDao,
    private readonly employeeBgvFeedbackDao: EmployeeBgvFeedbackDao,
    private readonly mediaDao: MediaDao,
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
  ) {}

  public async execute(params: Params): Promise<EmployeeBgvFeedbackResponseType> {
    this.logger.i('Creating employee BGV feedback', { employeeId: params.dto.employeeId });
    await this.validate(params);
    return await this.create(params);
  }

  private async validate(params: Params): Promise<void> {
    const employee = await this.employeeDao.getByUserId({ userId: params.dto.employeeId, organizationId: params.currentUser.organizationId });
    if (!employee) {
      throw new ApiError('Employee not found', 404);
    }
  }

  private async create(params: Params): Promise<EmployeeBgvFeedbackResponseType> {
    const createdId = await this.prisma.$transaction(async (tx) => {
      const feedbackId = await this.employeeBgvFeedbackDao.create({
        data: {
          user: { connect: { id: params.dto.employeeId } },
          organization: { connect: { id: params.currentUser.organizationId } },
          feedback: params.dto.feedback,
        },
        tx,
      });

      if (params.dto.files && params.dto.files.length > 0) {
        for (const file of params.dto.files) {
          const moved = await this.mediaService.moveTempFileAndGetKey({
            media: file,
            mediaPlacement: 'employee-bgv',
            relationId: feedbackId,
            isImage: file.type === MediaTypeDtoEnum.image,
          });
          if (moved) {
            const mediaId = await this.mediaDao.create({
              data: {
                key: moved.newKey,
                name: file.name,
                type: mediaTypeDtoEnumToDbEnum(file.type),
                size: moved.size,
                ext: moved.ext,
                organization: { connect: { id: params.currentUser.organizationId } },
              },
              tx,
            });
            await tx.employyBgvFeedbackHasMedia.create({
              data: {
                employeeBgvFeedback: { connect: { id: feedbackId } },
                media: { connect: { id: mediaId } },
              },
            });
          }
        }
      }

      return feedbackId;
    });

    const withMedia = await this.employeeBgvFeedbackDao.getByIdOrThrow({ id: createdId, organizationId: params.currentUser.organizationId });
    return dbToResponse(withMedia, this.s3Service);
  }
}
