import { z } from 'zod';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';

export const ChapterBaseFieldsSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  summaryPoints: z.array(z.string()).optional(),
});

export const ChapterCreateRequestSchema = ChapterBaseFieldsSchema.extend({
  media: MediaUpsertSchema.optional(),
});
export type ChapterCreateRequestType = z.infer<typeof ChapterCreateRequestSchema>;

export const ChapterUpdateRequestSchema = ChapterCreateRequestSchema.extend({});
export type ChapterUpdateRequestType = z.infer<typeof ChapterUpdateRequestSchema>;

export const ChapterListResponseSchema = ChapterBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ChapterListResponseType = z.infer<typeof ChapterListResponseSchema>;

export const ChapterDetailResponseSchema = ChapterBaseFieldsSchema.extend({
  id: z.number(),
  media: MediaResponseSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ChapterDetailResponseType = z.infer<typeof ChapterDetailResponseSchema>;

export const ChapterSortableColumns = ['title', 'description', 'createdAt', 'updatedAt'] as const;

export const ChapterMinResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
});
export type ChapterMinResponseType = z.infer<typeof ChapterMinResponseSchema>;
