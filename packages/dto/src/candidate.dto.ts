import { z } from 'zod';

import { CandidateMediaTypeDtoEnum, CandidateProgressDtoEnum, CandidateSourceDtoEnum, CandidateStatusDtoEnum, NoticePeriodUnitDtoEnum } from './enum.js';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const CandidateBaseFieldsSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  contactNumbers: z.array(z.string()).default([]),
  source: z.nativeEnum(CandidateSourceDtoEnum),
  urls: z.array(z.string()).default([]),
  expInYears: z.number().min(0),
  relevantExpInYears: z.number().min(0),
  skills: z.array(z.string()).default([]),
  currentCtcInLacs: z.number().min(0),
  expectedCtcInLacs: z.number().min(0),
  noticePeriod: z.number().min(0),
  noticePeriodUnit: z.nativeEnum(NoticePeriodUnitDtoEnum),
  status: z.nativeEnum(CandidateStatusDtoEnum).optional(),
  progress: z.nativeEnum(CandidateProgressDtoEnum).optional(),
});

export const CandidateCreateRequestSchema = CandidateBaseFieldsSchema.extend({
  resume: MediaUpsertSchema.optional(),
  offerLetters: z.array(MediaUpsertSchema).optional(),
  otherDocuments: z.array(MediaUpsertSchema).optional(),
});
export type CandidateCreateRequestType = z.infer<typeof CandidateCreateRequestSchema>;

export const CandidateUpdateRequestSchema = CandidateCreateRequestSchema.extend({});
export type CandidateUpdateRequestType = z.infer<typeof CandidateUpdateRequestSchema>;

export const CandidateMediaResponseSchema = MediaResponseSchema.extend({
  candidateMediaType: z.nativeEnum(CandidateMediaTypeDtoEnum),
});
export type CandidateMediaResponseType = z.infer<typeof CandidateMediaResponseSchema>;

export const CandidateListResponseSchema = CandidateBaseFieldsSchema.extend({
  id: z.number(),
  status: z.nativeEnum(CandidateStatusDtoEnum),
  progress: z.nativeEnum(CandidateProgressDtoEnum),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CandidateListResponseType = z.infer<typeof CandidateListResponseSchema>;

export const CandidateDetailResponseSchema = CandidateListResponseSchema.extend({
  resume: MediaResponseSchema.optional(),
  offerLetters: z.array(MediaResponseSchema).optional(),
  otherDocuments: z.array(MediaResponseSchema).optional(),
});
export type CandidateDetailResponseType = z.infer<typeof CandidateDetailResponseSchema>;

export const CandidateSortableColumns = ['firstname', 'lastname', 'email', 'status', 'progress', 'source', 'createdAt', 'updatedAt'] as const;

export const CandidateFilterRequestSchema = FilterRequestSchema.extend({
  status: z.array(z.nativeEnum(CandidateStatusDtoEnum)).optional(),
  progress: z.array(z.nativeEnum(CandidateProgressDtoEnum)).optional(),
  source: z.array(z.nativeEnum(CandidateSourceDtoEnum)).optional(),
});
export type CandidateFilterRequestType = z.infer<typeof CandidateFilterRequestSchema>;

export const CandidateMinResponseSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
});
export type CandidateMinResponseType = z.infer<typeof CandidateMinResponseSchema>;

export const CandidateUpdateStatusRequestSchema = z.object({
  status: z.nativeEnum(CandidateStatusDtoEnum),
});
export type CandidateUpdateStatusRequestType = z.infer<typeof CandidateUpdateStatusRequestSchema>;

export const CandidateUpdateProgressRequestSchema = z.object({
  progress: z.nativeEnum(CandidateProgressDtoEnum),
});
export type CandidateUpdateProgressRequestType = z.infer<typeof CandidateUpdateProgressRequestSchema>;
