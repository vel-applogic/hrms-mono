import { z } from 'zod';
import { DeviceStatusDtoEnum, DeviceTypeDtoEnum, MediaTypeDtoEnum } from './enum.js';
import { MediaResponseSchema, UpsertMediaSchema } from './media.dto.js';
import { FilterRequestSchema } from './pagination-filter.dto.js';

const DeviceBaseFieldsSchema = z.object({
  type: z.enum(DeviceTypeDtoEnum),
  brand: z.string().min(1, 'Brand is required').trim(),
  model: z.string().min(1, 'Model is required').trim(),
  serialNumber: z.string().min(1, 'Serial number is required').trim(),
  price: z.number().min(0, 'Price must be non-negative'),
  purchasedAt: z.string().datetime({ offset: true }).optional(),
  warrantyExpiresAt: z.string().datetime({ offset: true }),
  inWarranty: z.boolean().optional(),
  status: z.enum(DeviceStatusDtoEnum),
  config: z.string().optional(),
  assignedToId: z.number().optional(),
});

export const DeviceMediaUpsertSchema = UpsertMediaSchema.extend({
  caption: z.string().optional(),
});
export type DeviceMediaUpsertType = z.infer<typeof DeviceMediaUpsertSchema>;

export const DeviceCreateRequestSchema = DeviceBaseFieldsSchema.extend({
  medias: z.array(DeviceMediaUpsertSchema).optional(),
});
export type DeviceCreateRequestType = z.infer<typeof DeviceCreateRequestSchema>;

export const DeviceUpdateRequestSchema = DeviceCreateRequestSchema.extend({
  id: z.number(),
});
export type DeviceUpdateRequestType = z.infer<typeof DeviceUpdateRequestSchema>;

export const DeviceMediaResponseSchema = MediaResponseSchema.extend({
  caption: z.string().optional(),
});
export type DeviceMediaResponseType = z.infer<typeof DeviceMediaResponseSchema>;

export const DeviceAssignedUserSchema = z.object({
  id: z.number(),
  firstname: z.string(),
  lastname: z.string(),
});
export type DeviceAssignedUserType = z.infer<typeof DeviceAssignedUserSchema>;

export const DeviceResponseSchema = DeviceBaseFieldsSchema.extend({
  id: z.number(),
  assignedTo: DeviceAssignedUserSchema.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DeviceResponseType = z.infer<typeof DeviceResponseSchema>;

export const DevicePossessionHistoryResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  firstname: z.string(),
  lastname: z.string(),
  fromDate: z.string(),
  toDate: z.string().optional(),
  notes: z.array(z.string()),
});
export type DevicePossessionHistoryResponseType = z.infer<typeof DevicePossessionHistoryResponseSchema>;

export const DeviceDetailResponseSchema = DeviceResponseSchema.extend({
  medias: z.array(DeviceMediaResponseSchema).optional(),
  possessionHistories: z.array(DevicePossessionHistoryResponseSchema).optional(),
});
export type DeviceDetailResponseType = z.infer<typeof DeviceDetailResponseSchema>;

export const DeviceSortableColumns = ['type', 'model', 'status', 'createdAt', 'updatedAt'] as const;

export const DeviceFilterRequestSchema = FilterRequestSchema.extend({
  statuses: z.array(z.enum(DeviceStatusDtoEnum)).optional(),
  types: z.array(z.enum(DeviceTypeDtoEnum)).optional(),
  assignedToIds: z.array(z.number()).optional(),
});
export type DeviceFilterRequestType = z.infer<typeof DeviceFilterRequestSchema>;

// Employee device view (read-only for employees)
export const EmployeeDeviceResponseSchema = z.object({
  id: z.number(),
  type: z.enum(DeviceTypeDtoEnum),
  brand: z.string(),
  model: z.string(),
  serialNumber: z.string(),
  status: z.enum(DeviceStatusDtoEnum),
  config: z.string().optional(),
  medias: z.array(DeviceMediaResponseSchema).optional(),
});
export type EmployeeDeviceResponseType = z.infer<typeof EmployeeDeviceResponseSchema>;
