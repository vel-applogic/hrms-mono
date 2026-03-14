import {
  MediaGetSignedUrlRequestType,
  MediaGetSignedUrlResponseSchema,
  MediaGetSignedUrlResponseType,
  MediaUploadRequestType,
  MediaUploadResponseSchema,
  MediaUploadResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class MediaService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.BACKEND_API_URL));
  }

  async getSignedUrlForUpload(data: MediaUploadRequestType): Promise<MediaUploadResponseType> {
    return this.put<MediaUploadResponseType, MediaUploadRequestType>({ url: '/api/media/get-signed-url-for-upload', data, responseSchema: MediaUploadResponseSchema });
  }

  async getSignedUrlForView(params: MediaGetSignedUrlRequestType): Promise<MediaGetSignedUrlResponseType> {
    return this.patch<MediaGetSignedUrlResponseType, MediaGetSignedUrlRequestType>({
      url: '/api/media/get-signed-url-for-view',
      data: params,
      responseSchema: MediaGetSignedUrlResponseSchema,
    });
  }
}

export const mediaService = new MediaService();
