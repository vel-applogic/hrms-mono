import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export const CandidateFeedbackFilterRequestSchema = FilterRequestSchema.extend({
  candidateId: z.number(),
});
export type CandidateFeedbackFilterRequestType = z.infer<typeof CandidateFeedbackFilterRequestSchema>;

export const CandidateFeedbackCreateRequestSchema = z.object({
  candidateId: z.number(),
  feedback: z.string().min(1),
});
export type CandidateFeedbackCreateRequestType = z.infer<typeof CandidateFeedbackCreateRequestSchema>;

export const CandidateFeedbackUpdateRequestSchema = z.object({
  feedback: z.string().min(1),
});
export type CandidateFeedbackUpdateRequestType = z.infer<typeof CandidateFeedbackUpdateRequestSchema>;

export const CandidateFeedbackResponseSchema = z.object({
  id: z.number(),
  candidateId: z.number(),
  feedback: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  givenBy: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
  }),
});
export type CandidateFeedbackResponseType = z.infer<typeof CandidateFeedbackResponseSchema>;
