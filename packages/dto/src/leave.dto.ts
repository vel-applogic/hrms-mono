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

export enum LeaveDayHalfDtoEnum {
  full = 'full',
  firstHalf = 'firstHalf',
  secondHalf = 'secondHalf',
}

export const LeaveFilterRequestSchema = FilterRequestSchema.extend({
  status: z.array(z.nativeEnum(LeaveStatusDtoEnum)).optional(),
  userId: z.array(z.number()).optional(),
  financialYear: z.string().optional(),
});
export type LeaveFilterRequestType = z.infer<typeof LeaveFilterRequestSchema>;

export const LeaveCounterResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  financialYear: z.string(),
  casualLeaves: z.number(),
  sickLeaves: z.number(),
  earnedLeaves: z.number(),
  totalLeavesUsed: z.number(),
  totalLeavesAvailable: z.number(),
  user: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    email: z.string(),
  }),
});
export type LeaveCounterResponseType = z.infer<typeof LeaveCounterResponseSchema>;

export const LeaveCreateRequestSchema = z
  .object({
    userId: z.number().min(1, 'Select an employee'),
    leaveType: z.nativeEnum(LeaveTypeDtoEnum),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    startDuration: z.nativeEnum(LeaveDayHalfDtoEnum),
    endDuration: z.nativeEnum(LeaveDayHalfDtoEnum),
    reason: z.string().min(1),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start;
    },
    { message: 'End date must be on or after start date', path: ['endDate'] },
  )
  .refine(
    (data) => {
      // Same day rules
      if (data.startDate === data.endDate) {
        // If start is firstHalf or secondHalf, end must equal start (same half)
        if (data.startDuration !== LeaveDayHalfDtoEnum.full && data.startDuration !== data.endDuration) {
          return false;
        }
        return true;
      }
      // Different day rules:
      // - startDuration cannot be firstHalf when dates differ (must select full day or take a single half-day same date)
      if (data.startDuration === LeaveDayHalfDtoEnum.firstHalf) {
        return false;
      }
      // - endDuration cannot be secondHalf when dates differ (taking until end of day == full day)
      if (data.endDuration === LeaveDayHalfDtoEnum.secondHalf) {
        return false;
      }
      return true;
    },
    { message: 'Invalid half-day selection for the chosen date range', path: ['endDuration'] },
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
  startDuration: z.nativeEnum(LeaveDayHalfDtoEnum),
  endDuration: z.nativeEnum(LeaveDayHalfDtoEnum),
  numberOfDays: z.number(),
  reason: z.string(),
  status: z.nativeEnum(LeaveStatusDtoEnum),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type LeaveResponseType = z.infer<typeof LeaveResponseSchema>;
