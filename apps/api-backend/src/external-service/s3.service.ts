import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { BaseS3Service } from '@repo/nest-lib';

import { AppConfigService } from '#src/config/app-config.service.js';

// TODO extend baseService
@Injectable()
export class S3Service extends BaseS3Service {
  constructor(private appConfigService: AppConfigService) {
    super({
      region: appConfigService.awsRegion,
      credentials: appConfigService.isLocal
        ? {
            accessKeyId: appConfigService.awsAccessKeyId!,
            secretAccessKey: appConfigService.awsSecretAccessKey!,
          }
        : undefined,
      endpoint: appConfigService.isLocal ? appConfigService.awsEndpoint : undefined,
      forcePathStyle: appConfigService.isLocal ? true : undefined,
    });
  }

  public async getSignedUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.appConfigService.awsS3BucketName,
      Key: s3Key,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return url;
  }
  public async copyObject(params: { fromKey: string; toKey: string }): Promise<void> {
    await super.copyObject({
      bucketName: this.appConfigService.awsS3BucketName,
      fromKey: params.fromKey,
      toKey: params.toKey,
    });
  }

  public async getPutSignedUrl(s3Key: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.appConfigService.awsS3BucketName,
      Key: s3Key,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    return url;
  }
}
