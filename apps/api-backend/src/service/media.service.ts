import { Injectable } from '@nestjs/common';
import { MediaPlacementType, MediaUpsertType } from '@repo/dto';
import { CommonLoggerService } from '@repo/nest-lib';

import { AppConfigService } from '#src/config/app-config.service.js';
import { S3Service } from '#src/external-service/s3.service.js';

@Injectable()
export class MediaService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly s3Service: S3Service,
    private readonly logger: CommonLoggerService,
  ) {}

  public async moveTempFileAndGetKey(params: {
    media: MediaUpsertType;
    mediaPlacement: MediaPlacementType;
    relationId: number;
    isImage: boolean;
  }): Promise<{ newKey: string; size: number; ext: string } | undefined> {
    if (!params.media.key) {
      return undefined;
    }
    if (params.media.key.startsWith('temp/')) {
      // Move the thumbnail from temp to actual location
      const newKey = `${params.mediaPlacement}/${params.relationId}/${params.media.key.replace('temp/', '')}`;
      await this.s3Service.copyObject({
        fromKey: params.media.key,
        toKey: newKey,
      });
      const size = await this.s3Service.getFileSizeInBytes(this.appConfigService.awsS3BucketName, newKey);
      let ext = '';
      const filename = newKey.split('/').pop();
      if (filename && filename.includes('.')) {
        ext = filename.substring(filename.lastIndexOf('.') + 1);
      }

      // TODO: resize image if it is an image
      if (params.isImage) {
        // const image = await this.s3Service.resizeImage(newKey);
      }
      return { newKey, size, ext };
    }
  }
}
