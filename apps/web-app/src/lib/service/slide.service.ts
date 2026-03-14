import {
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
  SlideCreateRequestType,
  SlideDetailResponseSchema,
  SlideDetailResponseType,
  SlideFilterRequestType,
  SlideListResponseSchema,
  SlideListResponseType,
  SlideUpdateRequestType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class SlideService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: SlideFilterRequestType): Promise<PaginatedResponseType<SlideListResponseType>> {
    return this.patch<PaginatedResponseType<SlideListResponseType>, SlideFilterRequestType>({
      url: '/api/slide/search',
      data: params,
      responseSchema: PaginatedResponseSchema(SlideListResponseSchema),
    });
  }

  async getById(id: number): Promise<SlideDetailResponseType> {
    return this.get<SlideDetailResponseType>({
      url: `/api/slide/${id}`,
      responseSchema: SlideDetailResponseSchema,
    });
  }

  async create(data: SlideCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, SlideCreateRequestType>({
      url: '/api/slide',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: SlideUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, SlideUpdateRequestType>({
      url: `/api/slide/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/slide/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const slideService = new SlideService();
