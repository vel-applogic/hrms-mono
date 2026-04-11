import { z } from 'zod';

import { NotificationLinkDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const NotificationBaseFieldsSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  message: z.string().min(1, 'Message is required').trim(),
  link: z.enum(NotificationLinkDtoEnum),
});

export const NotificationCreateRequestSchema = NotificationBaseFieldsSchema.extend({
  userId: z.number(),
});
export type NotificationCreateRequestType = z.infer<typeof NotificationCreateRequestSchema>;

export const NotificationResponseSchema = NotificationBaseFieldsSchema.extend({
  id: z.number(),
  userId: z.number(),
  isSeen: z.boolean(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
export type NotificationResponseType = z.infer<typeof NotificationResponseSchema>;

export const NotificationFilterRequestSchema = FilterRequestSchema.extend({});
export type NotificationFilterRequestType = z.infer<typeof NotificationFilterRequestSchema>;
