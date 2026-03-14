'use server';

import { MediaGetSignedUrlRequestType, MediaGetSignedUrlResponseType, MediaUploadRequestType, MediaUploadResponseType } from '@repo/dto';

import { mediaService } from '@/lib/service/media.service';

export async function getSignedUrlForUploadAction(data: MediaUploadRequestType): Promise<MediaUploadResponseType> {
  return mediaService.getSignedUrlForUpload(data);
}

export async function getSignedUrlForViewAction(params: MediaGetSignedUrlRequestType): Promise<MediaGetSignedUrlResponseType> {
  return mediaService.getSignedUrlForView(params);
}
