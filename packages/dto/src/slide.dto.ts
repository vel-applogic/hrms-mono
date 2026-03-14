import { z } from 'zod';
import { ChapterListResponseSchema, ChapterMinResponseSchema } from './chapter.dto.js';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';
import { ThemeMinResponseSchema } from './theme.dto.js';
import { TopicListResponseSchema, TopicMinResponseSchema } from './topic.dto.js';

export const SlideContentItemsEnum = z.enum(['text', 'image']);

export const SlideBaseFieldsSchema = z.object({
  topicId: z.number(),
  chapterId: z.number(),
});

export const SlideCreateRequestSchema = SlideBaseFieldsSchema.extend({
  content: z.object({
    list: z
      .array(
        z
          .object({
            type: SlideContentItemsEnum,
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
  themeIds: z.array(z.number()).optional(),
});
export type SlideCreateRequestType = z.infer<typeof SlideCreateRequestSchema>;

export const SlideUpdateRequestSchema = SlideCreateRequestSchema.extend({});
export type SlideUpdateRequestType = z.infer<typeof SlideUpdateRequestSchema>;

export const SlideListResponseSchema = SlideBaseFieldsSchema.extend({
  id: z.number(),
  topic: TopicMinResponseSchema,
  chapter: ChapterMinResponseSchema,
  themes: z.array(ThemeMinResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type SlideListResponseType = z.infer<typeof SlideListResponseSchema>;

export const SlideDetailResponseSchema = SlideListResponseSchema.omit({ topicId: true, chapterId: true }).extend({
  content: z.string(),
  topic: TopicListResponseSchema,
  chapter: ChapterListResponseSchema,
});
export type SlideDetailResponseType = z.infer<typeof SlideDetailResponseSchema>;

export const SlideSortableColumns = ['content', 'createdAt', 'updatedAt'] as const;

export const SlideFilterRequestSchema = FilterRequestSchema.extend({
  topicId: z.number().optional(),
  chapterId: z.number().optional(),
  themeIds: z.array(z.number()).optional(),
});
export type SlideFilterRequestType = z.infer<typeof SlideFilterRequestSchema>;
