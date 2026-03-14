import {
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
  TopicCreateRequestType,
  TopicDetailResponseSchema,
  TopicDetailResponseType,
  TopicFilterRequestType,
  TopicListResponseSchema,
  TopicListResponseType,
  TopicUpdateRequestType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class TopicService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: TopicFilterRequestType): Promise<PaginatedResponseType<TopicListResponseType>> {
    return this.patch<PaginatedResponseType<TopicListResponseType>, TopicFilterRequestType>({
      url: '/api/topic/search',
      data: params,
      responseSchema: PaginatedResponseSchema(TopicListResponseSchema),
    });
  }

  async getById(id: number): Promise<TopicDetailResponseType> {
    return this.get<TopicDetailResponseType>({
      url: `/api/topic/${id}`,
      responseSchema: TopicDetailResponseSchema,
    });
  }

  async create(data: TopicCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, TopicCreateRequestType>({
      url: '/api/topic',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: TopicUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, TopicUpdateRequestType>({
      url: `/api/topic/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/topic/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const topicService = new TopicService();
