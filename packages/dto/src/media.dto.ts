import { z } from 'zod';
import { MediaTypeDtoEnum } from './enum.js';

export type MediaPlacementType = 'avatar' | 'candidate' | 'device' | 'employee' | 'employee-bgv' | 'policy' | 'organization';

export const MediaSchema = z.object({
  name: z.string(),
  key: z.string(),
  type: z.enum(MediaTypeDtoEnum),
});
export type MediaType = z.infer<typeof MediaSchema>;

export const MediaUpsertSchema = MediaSchema.extend({
  id: z.number().optional(),
  additionalInformation: z.string().optional(),
});
export type MediaUpsertType = z.infer<typeof MediaUpsertSchema>;

export const MediaResponseSchema = z.object({
  id: z.number(),
  key: z.string(),
  type: z.enum(MediaTypeDtoEnum),
  name: z.string(),
  size: z.number(),
  ext: z.string(),
  urlFull: z.string(),
  urlSmall: z.string().optional(),
  additionalInformation: z.string().optional(),
});
export type MediaResponseType = z.infer<typeof MediaResponseSchema>;

export const UpsertMediaSchema = MediaSchema.extend({
  id: z.number().optional(),
  additionalInformation: z.string().optional(),
});
export type UpsertMediaType = z.infer<typeof UpsertMediaSchema>;

// MEDIA UPLOAD
export const MediaUploadResponseSchema = z.object({
  key: z.string(),
  url: z.string(),
});
export type MediaUploadResponseType = z.infer<typeof MediaUploadResponseSchema>;

export const MediaUploadRequestSchema = z.object({
  key: z.string(),
});
export type MediaUploadRequestType = z.infer<typeof MediaUploadRequestSchema>;

// SIGNED URL
export const MediaGetSignedUrlRequestSchema = z.object({
  key: z.string(),
});
export type MediaGetSignedUrlRequestType = z.infer<typeof MediaGetSignedUrlRequestSchema>;

export const MediaGetSignedUrlResponseSchema = z.object({
  url: z.string(),
});
export type MediaGetSignedUrlResponseType = z.infer<typeof MediaGetSignedUrlResponseSchema>;
