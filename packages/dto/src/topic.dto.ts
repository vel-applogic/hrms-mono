import { z } from 'zod';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const TopicBaseFieldsSchema = z.object({
  title: z.string().min(1),
  chapterId: z.number(),
});

export const TopicCreateRequestSchema = TopicBaseFieldsSchema.extend({
  media: MediaUpsertSchema.optional(),
});
export type TopicCreateRequestType = z.infer<typeof TopicCreateRequestSchema>;

export const TopicUpdateRequestSchema = TopicCreateRequestSchema.extend({});
export type TopicUpdateRequestType = z.infer<typeof TopicUpdateRequestSchema>;

export const TopicListResponseSchema = TopicBaseFieldsSchema.extend({
  id: z.number(),
  chapterTitle: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TopicListResponseType = z.infer<typeof TopicListResponseSchema>;

export const TopicDetailResponseSchema = TopicBaseFieldsSchema.extend({
  id: z.number(),
  media: MediaResponseSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TopicDetailResponseType = z.infer<typeof TopicDetailResponseSchema>;

export const TopicSortableColumns = ['title', 'createdAt', 'updatedAt'] as const;

export const TopicFilterRequestSchema = FilterRequestSchema.extend({
  chapterId: z.number().optional(),
});
export type TopicFilterRequestType = z.infer<typeof TopicFilterRequestSchema>;

export const TopicMinResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
});
export type TopicMinResponseType = z.infer<typeof TopicMinResponseSchema>;
