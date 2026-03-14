import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  public get isLocal(): boolean {
    return this.configService.getOrThrow<string>('APP_ENV') === 'local';
  }

  get appEnv(): string {
    return this.configService.getOrThrow<string>('APP_ENV');
  }

  get pgDatabaseUrl(): string {
    return this.configService.getOrThrow<string>('PG_DATABASE_URL');
  }

  get webAppBaseUrl(): string {
    return this.configService.getOrThrow<string>('WEB_APP_BASE_URL');
  }

  get saltRounds(): number {
    return this.configService.getOrThrow<number>('SALT_ROUNDS');
  }

  // MAIL

  get mailHost(): string {
    return this.configService.getOrThrow<string>('MAIL_HOST');
  }

  get mailPort(): number {
    return this.configService.getOrThrow<number>('MAIL_PORT');
  }

  get mailSecure(): boolean {
    return this.configService.getOrThrow<boolean>('MAIL_SECURE');
  }

  get mailUser(): string {
    return this.configService.getOrThrow<string>('MAIL_USER');
  }

  get mailPassword(): string {
    return this.configService.getOrThrow<string>('MAIL_PASSWORD');
  }

  get mailNoReply(): string {
    return this.configService.getOrThrow<string>('MAIL_NOREPLY');
  }

  // AWS S3
  public get awsAccessKeyId(): string | undefined {
    return this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
  }

  public get awsSecretAccessKey(): string | undefined {
    return this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');
  }

  public get awsRegion(): string {
    return this.configService.getOrThrow<string>('AWS_REGION');
  }

  public get awsS3BucketName(): string {
    return this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
  }

  public get awsEndpoint(): string | undefined {
    return this.configService.get<string>('AWS_ENDPOINT');
  }
}
