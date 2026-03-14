import { z } from 'zod';

import { EmployeeStatusDtoEnum } from './enum.js';
import { MediaResponseSchema, MediaUpsertSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

export const EmployeeBaseFieldsSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  personalEmail: z.string().email().optional().nullable(),
  dob: z.string(),
  pan: z.string().min(1),
  aadhaar: z.string().min(1),
  designation: z.string().min(1),
  dateOfJoining: z.string(),
  dateOfLeaving: z.string().optional().nullable(),
  status: z.nativeEnum(EmployeeStatusDtoEnum),
  reportToId: z.number().optional().nullable(),
});

export const EmployeeCreateRequestSchema = EmployeeBaseFieldsSchema.extend({
  password: z.string().min(1),
  photo: MediaUpsertSchema.optional(),
});
export type EmployeeCreateRequestType = z.infer<typeof EmployeeCreateRequestSchema>;

export const EmployeeUpdateRequestSchema = EmployeeBaseFieldsSchema.extend({
  photo: MediaUpsertSchema.optional(),
});
export type EmployeeUpdateRequestType = z.infer<typeof EmployeeUpdateRequestSchema>;

export const EmployeeUpdateDocumentsRequestSchema = z.object({
  photo: MediaUpsertSchema.optional(),
  documents: z.array(MediaUpsertSchema.extend({ caption: z.string().optional() })).optional(),
});
export type EmployeeUpdateDocumentsRequestType = z.infer<typeof EmployeeUpdateDocumentsRequestSchema>;

export const EmployeeListResponseSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  designation: z.string(),
  status: z.nativeEnum(EmployeeStatusDtoEnum),
  dateOfJoining: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EmployeeListResponseType = z.infer<typeof EmployeeListResponseSchema>;

export const EmployeeDetailResponseSchema = EmployeeListResponseSchema.extend({
  personalEmail: z.string().optional().nullable(),
  dob: z.string(),
  pan: z.string(),
  aadhaar: z.string(),
  dateOfLeaving: z.string().optional().nullable(),
  reportToId: z.number().optional().nullable(),
  reportTo: z
    .object({
      id: z.number(),
      firstname: z.string(),
      lastname: z.string(),
      email: z.string(),
    })
    .optional()
    .nullable(),
  photo: MediaResponseSchema.optional(),
  documents: z.array(MediaResponseSchema.extend({ caption: z.string().optional().nullable() })).optional(),
});
export type EmployeeDetailResponseType = z.infer<typeof EmployeeDetailResponseSchema>;

export const EmployeeSortableColumns = ['firstname', 'lastname', 'email', 'designation', 'status', 'dateOfJoining', 'createdAt', 'updatedAt'] as const;

export const EmployeeFilterRequestSchema = FilterRequestSchema.extend({
  status: z.array(z.nativeEnum(EmployeeStatusDtoEnum)).optional(),
});
export type EmployeeFilterRequestType = z.infer<typeof EmployeeFilterRequestSchema>;
