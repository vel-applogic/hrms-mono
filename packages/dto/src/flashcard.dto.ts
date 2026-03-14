import { z } from 'zod';
import { ThemeListResponseSchema } from './theme.dto.js';
import { ChapterListResponseSchema } from './chapter.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const FlashcardTopicResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export const FlashcardBaseFieldsSchema = z.object({
  contentFront: z.string().min(1),
  contentBack: z.string().min(1),
  topicId: z.number(),
  chapterId: z.number(),
});

export const FlashcardCreateRequestSchema = FlashcardBaseFieldsSchema.extend({
  themeIds: z.array(z.number()).optional(),
});
export type FlashcardCreateRequestType = z.infer<typeof FlashcardCreateRequestSchema>;

export const FlashcardUpdateRequestSchema = FlashcardBaseFieldsSchema.extend({
  themeIds: z.array(z.number()).optional(),
});
export type FlashcardUpdateRequestType = z.infer<typeof FlashcardUpdateRequestSchema>;

export const FlashcardListResponseSchema = FlashcardBaseFieldsSchema.extend({
  id: z.number(),
  topic: FlashcardTopicResponseSchema,
  chapter: ChapterListResponseSchema,
  themes: z.array(ThemeListResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FlashcardListResponseType = z.infer<typeof FlashcardListResponseSchema>;

export const FlashcardDetailResponseSchema = FlashcardBaseFieldsSchema.extend({
  id: z.number(),
  themes: z.array(ThemeListResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type FlashcardDetailResponseType = z.infer<typeof FlashcardDetailResponseSchema>;

export const FlashcardSortableColumns = ['contentFront', 'contentBack', 'createdAt', 'updatedAt'] as const;

export const FlashcardFilterRequestSchema = FilterRequestSchema.extend({
  topicId: z.number().optional(),
  chapterId: z.number().optional(),
  themeIds: z.array(z.number()).optional(),
});
export type FlashcardFilterRequestType = z.infer<typeof FlashcardFilterRequestSchema>;
