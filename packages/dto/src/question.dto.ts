import { z } from 'zod';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { ThemeListResponseSchema } from './theme.dto.js';
import { ChapterListResponseSchema } from './chapter.dto.js';
import { TopicListResponseSchema } from './topic.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const QuestionTypeEnumSchema = z.enum(['mcq', 'trueOrFalse']);
export type QuestionTypeEnumType = z.infer<typeof QuestionTypeEnumSchema>;

export const QuestionAnswerOptionSchema = z.object({
  key: z.string().length(10), // 10 char alphanumeric
  value: z.string().min(1),
});
export type QuestionAnswerOptionType = z.infer<typeof QuestionAnswerOptionSchema>;

export const QuestionBaseFieldsSchema = z.object({
  question: z.string().min(1),
  type: QuestionTypeEnumSchema,
  answerOptions: z.array(QuestionAnswerOptionSchema).min(1),
  correctAnswerKeys: z.array(z.string()).min(1),
  explanation: z.string().min(1),
});

export const QuestionCreateRequestSchema = QuestionBaseFieldsSchema.extend({
  topicId: z.number(),
  chapterId: z.number(),
  media: MediaUpsertSchema.optional(),
  themeIds: z.array(z.number()).optional(),
});
export type QuestionCreateRequestType = z.infer<typeof QuestionCreateRequestSchema>;

export const QuestionUpdateRequestSchema = QuestionCreateRequestSchema.extend({
});
export type QuestionUpdateRequestType = z.infer<typeof QuestionUpdateRequestSchema>;

export const QuestionListResponseSchema = z.object({
  id: z.number(),
  question: z.string(),
  type: QuestionTypeEnumSchema,
  answerOptions: z.array(QuestionAnswerOptionSchema),
  topic: TopicListResponseSchema,
  chapter: ChapterListResponseSchema,
  correctAnswerKeys: z.array(z.string()).min(1),
  explanation: z.string(),
  themes: z.array(ThemeListResponseSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type QuestionListResponseType = z.infer<typeof QuestionListResponseSchema>;

export const QuestionDetailResponseSchema = QuestionListResponseSchema.extend({
  media: MediaResponseSchema.optional(),
});
export type QuestionDetailResponseType = z.infer<typeof QuestionDetailResponseSchema>;

export const QuestionSortableColumns = ['question', 'type', 'createdAt', 'updatedAt'] as const;

export const QuestionFilterRequestSchema = FilterRequestSchema.extend({
  topicId: z.number().optional(),
  chapterId: z.number().optional(),
  themeIds: z.array(z.number()).optional(),
});
export type QuestionFilterRequestType = z.infer<typeof QuestionFilterRequestSchema>;
