import { Injectable } from '@nestjs/common';
import { MediaUploadRequestType, MediaUploadResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, TrackQuery } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

type Params = {
  dto: MediaUploadRequestType;
  currentUser: CurrentUserType;
};

@Injectable()
@TrackQuery()
export class MediaGetSignedUrlForUploadUseCase extends BaseUc implements IUseCase<Params, MediaUploadResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<MediaUploadResponseType> {
    await this.validate(params);
    return await this.getSignedUrlForUpload(params);
  }

  private async validate(_params: Params): Promise<void> {
    // Placeholder for future validations
    // await this.isUserHasUpdateAccess(_params.currentUser.id);
  }

  private async getSignedUrlForUpload(params: Params): Promise<MediaUploadResponseType> {
    const key = `temp/${params.currentUser.id}/${new Date().getTime()}-${params.dto.key}`;
    const url = await this.s3Service.getPutSignedUrl(key);
    return {
      key,
      url,
    };
  }
}
