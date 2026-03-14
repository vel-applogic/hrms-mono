import { Injectable } from '@nestjs/common';
import { MediaGetSignedUrlResponseType } from '@repo/dto';
import { BaseUc, CommonLoggerService, CurrentUserType, IUseCase, PrismaService, TrackQuery } from '@repo/nest-lib';

import { S3Service } from '#src/external-service/s3.service.js';

type Params = {
  s3Key: string;
  currentUser: CurrentUserType;
};

@Injectable()
@TrackQuery()
export class MediaGetSignedUrlForViewUseCase extends BaseUc implements IUseCase<Params, MediaGetSignedUrlResponseType> {
  constructor(
    prisma: PrismaService,
    logger: CommonLoggerService,
    private readonly s3Service: S3Service,
  ) {
    super(prisma, logger);
  }

  public async execute(params: Params): Promise<MediaGetSignedUrlResponseType> {
    await this.validate(params);
    const url = await this.s3Service.getSignedUrl(params.s3Key);
    return { url };
  }

  async validate(params: Params): Promise<void> {
    // await this.isUserHasUpdateAccess(params.currentUser.id);
  }
}
