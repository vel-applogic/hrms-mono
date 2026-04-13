import { z } from 'zod';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const AnnouncementBaseFieldsSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  message: z.string().min(1, 'Message is required'),
  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  scheduledAt: z.string().datetime({ offset: true }),
  isPublished: z.boolean(),
});

export const AnnouncementCreateRequestSchema = AnnouncementBaseFieldsSchema.extend({});
export type AnnouncementCreateRequestType = z.infer<typeof AnnouncementCreateRequestSchema>;

export const AnnouncementUpdateRequestSchema = AnnouncementBaseFieldsSchema.extend({
  id: z.number(),
});
export type AnnouncementUpdateRequestType = z.infer<typeof AnnouncementUpdateRequestSchema>;

export const AnnouncementResponseSchema = AnnouncementBaseFieldsSchema.extend({
  id: z.number(),
  isNotificationSent: z.boolean(),
  branch: z.object({ id: z.number(), name: z.string() }).nullable(),
  department: z.object({ id: z.number(), name: z.string() }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
export type AnnouncementResponseType = z.infer<typeof AnnouncementResponseSchema>;

export const AnnouncementDetailResponseSchema = AnnouncementResponseSchema.extend({});
export type AnnouncementDetailResponseType = z.infer<typeof AnnouncementDetailResponseSchema>;

export const AnnouncementSortableColumns = ['title', 'scheduledAt', 'createdAt', 'updatedAt'] as const;

export const AnnouncementFilterRequestSchema = FilterRequestSchema.extend({
  branchIds: z.array(z.number()).optional(),
  departmentIds: z.array(z.number()).optional(),
  isPublished: z.boolean().optional(),
});
export type AnnouncementFilterRequestType = z.infer<typeof AnnouncementFilterRequestSchema>;
