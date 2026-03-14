import { z } from 'zod';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const PolicyContentItemsEnum = z.enum(['text', 'image']);

export const PolicyCreateRequestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.object({
    list: z
      .array(
        z
          .object({
            type: PolicyContentItemsEnum,
            content: z.string().min(1).optional(),
            image: MediaUpsertSchema.optional(),
          })
          .refine((data) => !(data.type === 'text' && (data.content === undefined || data.content.length === 0)), {
            message: "content is required when type is 'text'",
          })
          .refine((data) => !(data.type === 'image' && (data.image === undefined || data.image === null)), {
            message: "image is required when type is 'image'",
          }),
      )
      .min(1),
  }),
  mediaIds: z.array(z.number()).optional(),
});
export type PolicyCreateRequestType = z.infer<typeof PolicyCreateRequestSchema>;

export const PolicyUpdateRequestSchema = PolicyCreateRequestSchema.extend({});
export type PolicyUpdateRequestType = z.infer<typeof PolicyUpdateRequestSchema>;

export const PolicyListResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PolicyListResponseType = z.infer<typeof PolicyListResponseSchema>;

export const PolicyDetailResponseSchema = PolicyListResponseSchema.extend({
  content: z.string(),
  medias: z.array(MediaResponseSchema).optional(),
});
export type PolicyDetailResponseType = z.infer<typeof PolicyDetailResponseSchema>;

export const PolicySortableColumns = ['title', 'createdAt', 'updatedAt'] as const;

export const PolicyFilterRequestSchema = FilterRequestSchema.extend({});
export type PolicyFilterRequestType = z.infer<typeof PolicyFilterRequestSchema>;
