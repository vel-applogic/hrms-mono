import type {
  HolidayCreateRequestType,
  HolidayFilterRequestType,
  HolidayResponseType,
  HolidayUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  HolidayResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';
import { z } from 'zod';

import { BaseService } from './_base.service';

class HolidayService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async getYears(): Promise<number[]> {
    return this.get<number[]>({
      url: '/api/holiday/years',
      responseSchema: z.array(z.number()),
    });
  }

  async search(params: HolidayFilterRequestType): Promise<PaginatedResponseType<HolidayResponseType>> {
    return this.patch<PaginatedResponseType<HolidayResponseType>, HolidayFilterRequestType>({
      url: '/api/holiday/search',
      data: params,
      responseSchema: PaginatedResponseSchema(HolidayResponseSchema),
    });
  }

  async create(data: HolidayCreateRequestType): Promise<HolidayResponseType> {
    return this.post<HolidayResponseType, HolidayCreateRequestType>({
      url: '/api/holiday',
      data,
      responseSchema: HolidayResponseSchema,
    });
  }

  async update(id: number, data: HolidayUpdateRequestType): Promise<HolidayResponseType> {
    return this.put<HolidayResponseType, HolidayUpdateRequestType>({
      url: `/api/holiday/${id}`,
      data,
      responseSchema: HolidayResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/holiday/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const holidayService = new HolidayService();
