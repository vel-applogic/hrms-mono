import { CopyObjectCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand, PutObjectTaggingCommand, S3Client, Tag } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_SIGNED_URL_EXPIRATION } from '@repo/shared';
import { createReadStream } from 'fs';

export class BaseS3Service {
  protected s3: S3Client;

  constructor(params: { region: string; credentials?: { accessKeyId: string; secretAccessKey: string }; endpoint?: string; forcePathStyle?: boolean }) {
    this.s3 = new S3Client({
      region: params.region,
      credentials: params.credentials,
      endpoint: params.endpoint,
      forcePathStyle: params.forcePathStyle,
    });
  }

  protected async uploadWithTags(params: { bucketName: string; filePath: string; documentKey: string; tags: Tag[] }): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: params.bucketName,
      Key: params.documentKey,
      Body: createReadStream(params.filePath),
      // ContentType: mime.contentType(filePath) ?? undefined,
      Tagging: params.tags.map((tag) => `${tag.Key}=${tag.Value}`).join('&'),
    });
    await this.s3.send(command);
  }

  protected async tag(params: { bucketName: string; s3Key: string; tags: Tag[] }): Promise<void> {
    await this.s3.send(
      new PutObjectTaggingCommand({
        Bucket: params.bucketName,
        Key: params.s3Key,
        Tagging: {
          TagSet: params.tags,
        },
      }),
    );
  }

  protected async signedUrl(bucketName: string, s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: S3_SIGNED_URL_EXPIRATION });
    return url;
  }

  protected async putSignedUrl(bucketName: string, s3Key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ContentType: contentType,
    });
    const url = await getSignedUrl(this.s3, command, { expiresIn: S3_SIGNED_URL_EXPIRATION });
    return url;
  }

  public async getFileSizeInBytes(bucketName: string, s3Key: string): Promise<number> {
    const command = new HeadObjectCommand({ Bucket: bucketName, Key: s3Key });
    const resp = await this.s3.send(command);
    return Number(resp.ContentLength!.toFixed(2));
  }

  protected async objectExists(bucketName: string, s3Key: string): Promise<boolean> {
    try {
      await this.getFileSizeInBytes(bucketName, s3Key);
      return true;
    } catch (_err) {
      return false;
    }
  }

  protected async copyObject(params: { bucketName: string; fromKey: string; toKey: string }): Promise<void> {
    await this.s3.send(
      new CopyObjectCommand({
        Bucket: params.bucketName,
        CopySource: `${params.bucketName}/${params.fromKey}`,
        Key: params.toKey,
      }),
    );
  }
}
