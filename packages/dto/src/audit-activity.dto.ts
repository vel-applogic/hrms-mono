import * as z from 'zod';

import { AuditActivityStatusDtoEnum, AuditEntityTypeDtoEnum, AuditEventGroupDtoEnum, AuditEventTypeDtoEnum } from './enum.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';
import { UserMinResponseSchema } from './user.dto.js';

export const AuditActivityValueTypeSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.string(), z.unknown()), z.array(z.unknown()), z.null()]).optional(),
});
export type AuditActivityValueTypeType = z.infer<typeof AuditActivityValueTypeSchema>;

export const AuditActivityFieldChangeSchema = z.object({
  old: AuditActivityValueTypeSchema.nullable(),
  new: AuditActivityValueTypeSchema.nullable(),
});
export type AuditActivityFieldChangeType = z.infer<typeof AuditActivityFieldChangeSchema>;

export const AuditActivityDataSchema = z.object({
  changes: z.record(z.string(), AuditActivityFieldChangeSchema),
});
export type AuditActivityDataType = z.infer<typeof AuditActivityDataSchema>;

export const AuditActivityFilterRequestSchema = FilterRequestSchema.extend({
  eventGroups: z.array(z.enum(AuditEventGroupDtoEnum)).optional(),
  eventTypes: z.array(z.enum(AuditEventTypeDtoEnum)).optional(),
  userIds: z.array(z.number()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type AuditActivityFilterRequestType = z.infer<typeof AuditActivityFilterRequestSchema>;

export const AuditActivityResponseSchema = z.object({
  id: z.number(),
  timestamp: z.string().transform((dString) => new Date(dString)),
  user: UserMinResponseSchema.nullable(),
  eventGroup: z.enum(AuditEventGroupDtoEnum),
  eventType: z.enum(AuditEventTypeDtoEnum),
  status: z.enum(AuditActivityStatusDtoEnum),
  changes: z.record(z.string(), AuditActivityFieldChangeSchema),
  description: z.string().nullable(),
});
export type AuditActivityResponseType = z.infer<typeof AuditActivityResponseSchema>;

export const AuditActivityRelatedEntitySchema = z.object({
  entityType: z.enum(AuditEntityTypeDtoEnum),
  entityId: z.number(),
  message: z.string().nullable(),
  isSourceEntity: z.boolean(),
});
export type AuditActivityRelatedEntityType = z.infer<typeof AuditActivityRelatedEntitySchema>;

export const AuditActivityDetailResponseSchema = z.object({
  details: AuditActivityResponseSchema,
  entities: z.array(AuditActivityRelatedEntitySchema),
});
export type AuditActivityDetailResponseType = z.infer<typeof AuditActivityDetailResponseSchema>;

export const AuditActivityByRelatedEntityIdSchema = z.object({
  entityType: z.enum(AuditEntityTypeDtoEnum),
  entityId: z.number(),
});
export type AuditActivityByRelatedEntityIdType = z.infer<typeof AuditActivityByRelatedEntityIdSchema>;

export const AuditActivityByRelatedEntityRequestSchema = FilterRequestSchema.extend({
  id: z.array(AuditActivityByRelatedEntityIdSchema),
  eventGroups: z.array(z.enum(AuditEventGroupDtoEnum)).optional(),
  eventTypes: z.array(z.enum(AuditEventTypeDtoEnum)).optional(),
});
export type AuditActivityByRelatedEntityRequestType = z.infer<typeof AuditActivityByRelatedEntityRequestSchema>;

export const AuditActivitySortableColumns = ['id', 'timestamp', 'user', 'eventGroup', 'eventType', 'description'] as const;
