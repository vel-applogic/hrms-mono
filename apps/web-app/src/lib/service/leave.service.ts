import type {
  CountResponseType,
  LeaveCounterResponseType,
  LeaveCreateRequestType,
  LeaveFilterRequestType,
  LeaveResponseType,
  LeaveUpdateRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  CountResponseSchema,
  LeaveCounterResponseSchema,
  LeaveResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { z } from 'zod';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class LeaveService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async getCounters(financialYear: string): Promise<LeaveCounterResponseType[]> {
    return this.get<LeaveCounterResponseType[]>({
      url: `/api/leave/counters?financialYear=${encodeURIComponent(financialYear)}`,
      responseSchema: z.array(LeaveCounterResponseSchema),
    });
  }

  async search(params: LeaveFilterRequestType): Promise<PaginatedResponseType<LeaveResponseType>> {
    return this.patch<PaginatedResponseType<LeaveResponseType>, LeaveFilterRequestType>({
      url: '/api/leave/search',
      data: params,
      responseSchema: PaginatedResponseSchema(LeaveResponseSchema),
    });
  }

  async create(data: LeaveCreateRequestType): Promise<LeaveResponseType> {
    return this.post<LeaveResponseType, LeaveCreateRequestType>({
      url: '/api/leave',
      data,
      responseSchema: LeaveResponseSchema,
    });
  }

  async update(id: number, data: LeaveUpdateRequestType): Promise<LeaveResponseType> {
    return this.put<LeaveResponseType, LeaveUpdateRequestType>({
      url: `/api/leave/${id}`,
      data,
      responseSchema: LeaveResponseSchema,
    });
  }

  async cancel(id: number): Promise<LeaveResponseType> {
    return this.post<LeaveResponseType, Record<string, never>>({
      url: `/api/leave/${id}/cancel`,
      data: {},
      responseSchema: LeaveResponseSchema,
    });
  }

  async approve(id: number): Promise<LeaveResponseType> {
    return this.post<LeaveResponseType, Record<string, never>>({
      url: `/api/leave/${id}/approve`,
      data: {},
      responseSchema: LeaveResponseSchema,
    });
  }

  async reject(id: number): Promise<LeaveResponseType> {
    return this.post<LeaveResponseType, Record<string, never>>({
      url: `/api/leave/${id}/reject`,
      data: {},
      responseSchema: LeaveResponseSchema,
    });
  }

  async pendingCount(userId?: number): Promise<CountResponseType> {
    const params = userId ? `?userId=${userId}` : '';
    return this.get<CountResponseType>({
      url: `/api/leave/pending-count${params}`,
      responseSchema: CountResponseSchema,
    });
  }
}

export const leaveService = new LeaveService();
