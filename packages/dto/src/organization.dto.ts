import { z } from 'zod';

import { MediaTypeDtoEnum, NoOfDaysInMonthDtoEnum } from './enum.js';
import { MediaResponseSchema, UpsertMediaSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const OrganizationBaseFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
});

// SETTINGS

const OrganizationSettingBaseFieldsSchema = z.object({
  noOfDaysInMonth: z.enum(NoOfDaysInMonthDtoEnum),
  totalLeaveInDays: z.number().int().min(0),
  sickLeaveInDays: z.number().int().min(0),
  earnedLeaveInDays: z.number().int().min(0),
  casualLeaveInDays: z.number().int().min(0),
  maternityLeaveInDays: z.number().int().min(0),
  paternityLeaveInDays: z.number().int().min(0),
});

export const OrganizationSettingUpsertSchema = OrganizationSettingBaseFieldsSchema.extend({
  logo: UpsertMediaSchema,
});
export type OrganizationSettingUpsertType = z.infer<typeof OrganizationSettingUpsertSchema>;

export const OrganizationSettingResponseSchema = OrganizationSettingBaseFieldsSchema.extend({
  id: z.number(),
  logo: MediaResponseSchema,
});
export type OrganizationSettingResponseType = z.infer<typeof OrganizationSettingResponseSchema>;

// DOCUMENTS

export const OrganizationDocumentUpsertSchema = UpsertMediaSchema.extend({
  mediaType: z.enum(MediaTypeDtoEnum),
});
export type OrganizationDocumentUpsertType = z.infer<typeof OrganizationDocumentUpsertSchema>;

export const OrganizationDocumentResponseSchema = z.object({
  id: z.number(),
  mediaType: z.enum(MediaTypeDtoEnum),
  document: MediaResponseSchema,
});
export type OrganizationDocumentResponseType = z.infer<typeof OrganizationDocumentResponseSchema>;

// ORGANIZATION

export const OrganizationCreateRequestSchema = OrganizationBaseFieldsSchema.extend({
  email: z.string().email('Valid email is required'),
  settings: OrganizationSettingUpsertSchema.optional(),
  documents: z.array(OrganizationDocumentUpsertSchema).optional(),
});
export type OrganizationCreateRequestType = z.infer<typeof OrganizationCreateRequestSchema>;

export const OrganizationUpdateRequestSchema = OrganizationBaseFieldsSchema.extend({
  id: z.number(),
  settings: OrganizationSettingUpsertSchema.optional(),
  documents: z.array(OrganizationDocumentUpsertSchema).optional(),
  removeDocumentIds: z.array(z.number()).optional(),
});
export type OrganizationUpdateRequestType = z.infer<typeof OrganizationUpdateRequestSchema>;

export const OrganizationResponseSchema = OrganizationBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type OrganizationResponseType = z.infer<typeof OrganizationResponseSchema>;

export const OrganizationDetailResponseSchema = OrganizationResponseSchema.extend({
  settings: OrganizationSettingResponseSchema.nullable(),
  documents: z.array(OrganizationDocumentResponseSchema),
});
export type OrganizationDetailResponseType = z.infer<typeof OrganizationDetailResponseSchema>;

export const OrganizationSortableColumns = ['name', 'createdAt', 'updatedAt'] as const;

export const OrganizationFilterRequestSchema = FilterRequestSchema;
export type OrganizationFilterRequestType = z.infer<typeof OrganizationFilterRequestSchema>;
