import { z } from 'zod';

import { ReimbursementStatusDtoEnum } from './enum.js';
import { MediaResponseSchema, UpsertMediaSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const ReimbursementBaseFieldsSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  amount: z.number().min(1, 'Amount must be at least 1'),
  date: z.string().min(1, 'Date is required'),
});

export const ReimbursementCreateRequestSchema = ReimbursementBaseFieldsSchema.extend({
  files: z.array(UpsertMediaSchema).optional(),
});
export type ReimbursementCreateRequestType = z.infer<typeof ReimbursementCreateRequestSchema>;

export const ReimbursementUpdateStatusRequestSchema = z.object({
  status: z.enum(ReimbursementStatusDtoEnum),
  rejectReason: z.string().optional(),
});
export type ReimbursementUpdateStatusRequestType = z.infer<typeof ReimbursementUpdateStatusRequestSchema>;

export const ReimbursementAddFeedbackRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').trim(),
});
export type ReimbursementAddFeedbackRequestType = z.infer<typeof ReimbursementAddFeedbackRequestSchema>;

export const ReimbursementFeedbackResponseSchema = z.object({
  id: z.number(),
  message: z.string(),
  createdBy: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
  }),
  createdAt: z.string(),
});
export type ReimbursementFeedbackResponseType = z.infer<typeof ReimbursementFeedbackResponseSchema>;

export const ReimbursementResponseSchema = ReimbursementBaseFieldsSchema.extend({
  id: z.number(),
  userId: z.number(),
  user: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
  }),
  status: z.enum(ReimbursementStatusDtoEnum),
  rejectReason: z.string().nullable(),
  approvedAt: z.string().nullable(),
  paidAt: z.string().nullable(),
  lastFeedback: ReimbursementFeedbackResponseSchema.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ReimbursementResponseType = z.infer<typeof ReimbursementResponseSchema>;

export const ReimbursementDetailResponseSchema = ReimbursementResponseSchema.extend({
  medias: z.array(MediaResponseSchema),
  feedbacks: z.array(ReimbursementFeedbackResponseSchema),
});
export type ReimbursementDetailResponseType = z.infer<typeof ReimbursementDetailResponseSchema>;

export const ReimbursementFilterRequestSchema = FilterRequestSchema.extend({
  statuses: z.array(z.enum(ReimbursementStatusDtoEnum)).optional(),
  userIds: z.array(z.number()).optional(),
});
export type ReimbursementFilterRequestType = z.infer<typeof ReimbursementFilterRequestSchema>;
