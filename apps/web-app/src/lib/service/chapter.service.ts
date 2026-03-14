import {
  ChapterCreateRequestType,
  ChapterDetailResponseSchema,
  ChapterDetailResponseType,
  ChapterListResponseSchema,
  ChapterListResponseType,
  ChapterUpdateRequestType,
  FilterRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class ChapterService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: FilterRequestType): Promise<PaginatedResponseType<ChapterListResponseType>> {
    return this.patch<PaginatedResponseType<ChapterListResponseType>, FilterRequestType>({
      url: '/api/chapter/search',
      data: params,
      responseSchema: PaginatedResponseSchema(ChapterListResponseSchema),
    });
  }

  async getById(id: number): Promise<ChapterDetailResponseType> {
    return this.get<ChapterDetailResponseType>({
      url: `/api/chapter/${id}`,
      responseSchema: ChapterDetailResponseSchema,
    });
  }

  async create(data: ChapterCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, ChapterCreateRequestType>({
      url: '/api/chapter',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: ChapterUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, ChapterUpdateRequestType>({
      url: `/api/chapter/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/chapter/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const chapterService = new ChapterService();
