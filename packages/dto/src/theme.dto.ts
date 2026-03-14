import { z } from 'zod';

export const ThemeBaseFieldsSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export const ThemeCreateRequestSchema = ThemeBaseFieldsSchema.extend({});
export type ThemeCreateRequestType = z.infer<typeof ThemeCreateRequestSchema>;

export const ThemeUpdateRequestSchema = ThemeCreateRequestSchema.extend({});
export type ThemeUpdateRequestType = z.infer<typeof ThemeUpdateRequestSchema>;

export const ThemeListResponseSchema = ThemeBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ThemeListResponseType = z.infer<typeof ThemeListResponseSchema>;

export const ThemeDetailResponseSchema = ThemeBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ThemeDetailResponseType = z.infer<typeof ThemeDetailResponseSchema>;

export const ThemeSortableColumns = ['title', 'description', 'createdAt', 'updatedAt'] as const;

export const ThemeMinResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
});
export type ThemeMinResponseType = z.infer<typeof ThemeMinResponseSchema>;
