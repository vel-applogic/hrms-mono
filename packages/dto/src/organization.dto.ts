import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

const OrganizationBaseFieldsSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
});

export const OrganizationCreateRequestSchema = OrganizationBaseFieldsSchema.extend({
  email: z.string().email('Valid email is required'),
});
export type OrganizationCreateRequestType = z.infer<typeof OrganizationCreateRequestSchema>;

export const OrganizationUpdateRequestSchema = OrganizationBaseFieldsSchema.extend({
  id: z.number(),
});
export type OrganizationUpdateRequestType = z.infer<typeof OrganizationUpdateRequestSchema>;

export const OrganizationResponseSchema = OrganizationBaseFieldsSchema.extend({
  id: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type OrganizationResponseType = z.infer<typeof OrganizationResponseSchema>;

export const OrganizationSortableColumns = ['name', 'createdAt', 'updatedAt'] as const;

export const OrganizationFilterRequestSchema = FilterRequestSchema;
export type OrganizationFilterRequestType = z.infer<typeof OrganizationFilterRequestSchema>;
