import { Body, Controller, Patch, Put } from '@nestjs/common';
import type { MediaGetSignedUrlRequestType, MediaUploadRequestType } from '@repo/dto';
import { MediaGetSignedUrlRequestSchema, MediaGetSignedUrlResponseType, MediaUploadRequestSchema, MediaUploadResponseType } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { MediaGetSignedUrlForUploadUseCase } from './uc/media-get-signed-url-for-upload.uc.js';
import { MediaGetSignedUrlForViewUseCase } from './uc/media-get-signed-url-for-view.uc.js';

@Controller('/api/media')
export class MediaController {
  constructor(
    private readonly mediaGetSignedUrlForViewUseCase: MediaGetSignedUrlForViewUseCase,
    private readonly mediaGetSignedUrlForUploadUseCase: MediaGetSignedUrlForUploadUseCase,
  ) {}

  @Patch('/get-signed-url-for-view')
  public async getSignedUrl(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(MediaGetSignedUrlRequestSchema)) dto: MediaGetSignedUrlRequestType,
  ): Promise<MediaGetSignedUrlResponseType> {
    return await this.mediaGetSignedUrlForViewUseCase.execute({ currentUser, s3Key: dto.key });
  }

  @Put('/get-signed-url-for-upload')
  public async getPutSignedUrl(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(MediaUploadRequestSchema)) dto: MediaUploadRequestType,
  ): Promise<MediaUploadResponseType> {
    return this.mediaGetSignedUrlForUploadUseCase.execute({ currentUser, dto });
  }
}
