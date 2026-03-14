import { z } from 'zod';

import { FilterRequestSchema } from './pagination-filter.dto.js';

export enum LeaveTypeDtoEnum {
  casual = 'casual',
  sick = 'sick',
  medical = 'medical',
  earned = 'earned',
}

export enum LeaveStatusDtoEnum {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  cancelled = 'cancelled',
}

export const LeaveFilterRequestSchema = FilterRequestSchema.extend({
  status: z.array(z.nativeEnum(LeaveStatusDtoEnum)).optional(),
});
export type LeaveFilterRequestType = z.infer<typeof LeaveFilterRequestSchema>;

export const LeaveCreateRequestSchema = z
  .object({
    leaveType: z.nativeEnum(LeaveTypeDtoEnum),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    reason: z.string().min(1),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
    },
    { message: 'End date must be on or after start date', path: ['endDate'] },
  );
export type LeaveCreateRequestType = z.infer<typeof LeaveCreateRequestSchema>;

export const LeaveUpdateRequestSchema = LeaveCreateRequestSchema;
export type LeaveUpdateRequestType = z.infer<typeof LeaveUpdateRequestSchema>;

export const LeaveResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  user: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
  }),
  leaveType: z.nativeEnum(LeaveTypeDtoEnum),
  startDate: z.string(),
  endDate: z.string(),
  numberOfDays: z.number(),
  reason: z.string(),
  status: z.nativeEnum(LeaveStatusDtoEnum),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LeaveResponseType = z.infer<typeof LeaveResponseSchema>;
