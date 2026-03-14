import {
  FilterRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
  ThemeCreateRequestType,
  ThemeDetailResponseSchema,
  ThemeDetailResponseType,
  ThemeListResponseSchema,
  ThemeListResponseType,
  ThemeUpdateRequestType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class ThemeService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: FilterRequestType): Promise<PaginatedResponseType<ThemeListResponseType>> {
    return this.patch<PaginatedResponseType<ThemeListResponseType>, FilterRequestType>({
      url: '/api/theme/search',
      data: params,
      responseSchema: PaginatedResponseSchema(ThemeListResponseSchema),
    });
  }

  async getById(id: number): Promise<ThemeDetailResponseType> {
    return this.get<ThemeDetailResponseType>({
      url: `/api/theme/${id}`,
      responseSchema: ThemeDetailResponseSchema,
    });
  }

  async create(data: ThemeCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, ThemeCreateRequestType>({
      url: '/api/theme',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: ThemeUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, ThemeUpdateRequestType>({
      url: `/api/theme/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/theme/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const themeService = new ThemeService();
