import { z } from 'zod';

import { AddressResponseSchema, AddressUpsertSchema } from './address.dto.js';
import { ContactResponseSchema, ContactUpsertSchema } from './contact.dto.js';
import { CurrencyResponseSchema } from './currency.dto.js';
import { MediaTypeDtoEnum, NoOfDaysInMonthDtoEnum } from './enum.js';
import { MediaResponseSchema, UpsertMediaSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const OrganisationBaseFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
});

// SETTINGS

const OrganisationSettingBaseFieldsSchema = z.object({
  noOfDaysInMonth: z.enum(NoOfDaysInMonthDtoEnum),
  totalLeaveInDays: z.number().int().min(0),
  sickLeaveInDays: z.number().int().min(0),
  earnedLeaveInDays: z.number().int().min(0),
  casualLeaveInDays: z.number().int().min(0),
  maternityLeaveInDays: z.number().int().min(0),
  paternityLeaveInDays: z.number().int().min(0),
  weeklyOffDays: z.array(z.number().int().min(0).max(6)),
});

export const OrganisationSettingUpsertSchema = OrganisationSettingBaseFieldsSchema;
export type OrganisationSettingUpsertType = z.infer<typeof OrganisationSettingUpsertSchema>;

export const OrganisationSettingResponseSchema = OrganisationSettingBaseFieldsSchema.extend({
  id: z.number(),
});
export type OrganisationSettingResponseType = z.infer<typeof OrganisationSettingResponseSchema>;

// DOCUMENTS

export const OrganisationDocumentUpsertSchema = UpsertMediaSchema.extend({
  mediaType: z.enum(MediaTypeDtoEnum),
});
export type OrganisationDocumentUpsertType = z.infer<typeof OrganisationDocumentUpsertSchema>;

export const OrganisationDocumentResponseSchema = z.object({
  id: z.number(),
  mediaType: z.enum(MediaTypeDtoEnum),
  document: MediaResponseSchema,
});
export type OrganisationDocumentResponseType = z.infer<typeof OrganisationDocumentResponseSchema>;

// ORGANISATION

export const OrganisationCreateRequestSchema = OrganisationBaseFieldsSchema.extend({
  email: z.string().email('Valid email is required'),
  currencyId: z.number(),
  logo: UpsertMediaSchema.optional(),
  settings: OrganisationSettingUpsertSchema.optional(),
  documents: z.array(OrganisationDocumentUpsertSchema).optional(),
  address: AddressUpsertSchema.optional(),
  contacts: z.array(ContactUpsertSchema).optional(),
});
export type OrganisationCreateRequestType = z.infer<typeof OrganisationCreateRequestSchema>;

export const OrganisationUpdateRequestSchema = OrganisationBaseFieldsSchema.extend({
  id: z.number(),
  currencyId: z.number(),
  logo: UpsertMediaSchema.optional(),
  settings: OrganisationSettingUpsertSchema.optional(),
  documents: z.array(OrganisationDocumentUpsertSchema).optional(),
  removeDocumentIds: z.array(z.number()).optional(),
  address: AddressUpsertSchema.optional(),
  contacts: z.array(ContactUpsertSchema).optional(),
  removeContactIds: z.array(z.number()).optional(),
});
export type OrganisationUpdateRequestType = z.infer<typeof OrganisationUpdateRequestSchema>;

export const OrganisationResponseSchema = OrganisationBaseFieldsSchema.extend({
  id: z.number(),
  currency: CurrencyResponseSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type OrganisationResponseType = z.infer<typeof OrganisationResponseSchema>;

export const OrganisationDetailResponseSchema = OrganisationResponseSchema.extend({
  logo: MediaResponseSchema.nullable(),
  settings: OrganisationSettingResponseSchema.nullable(),
  documents: z.array(OrganisationDocumentResponseSchema),
  address: AddressResponseSchema.nullable(),
  contacts: z.array(ContactResponseSchema),
});
export type OrganisationDetailResponseType = z.infer<typeof OrganisationDetailResponseSchema>;

export const OrganisationSortableColumns = ['name', 'createdAt', 'updatedAt'] as const;

export const OrganisationFilterRequestSchema = FilterRequestSchema;
export type OrganisationFilterRequestType = z.infer<typeof OrganisationFilterRequestSchema>;
