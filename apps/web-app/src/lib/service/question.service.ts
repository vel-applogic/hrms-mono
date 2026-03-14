import {
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
  QuestionCreateRequestType,
  QuestionDetailResponseSchema,
  QuestionDetailResponseType,
  QuestionFilterRequestType,
  QuestionListResponseSchema,
  QuestionListResponseType,
  QuestionUpdateRequestType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class QuestionService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: QuestionFilterRequestType): Promise<PaginatedResponseType<QuestionListResponseType>> {
    return this.patch<PaginatedResponseType<QuestionListResponseType>, QuestionFilterRequestType>({
      url: '/api/question/search',
      data: params,
      responseSchema: PaginatedResponseSchema(QuestionListResponseSchema),
    });
  }

  async getById(id: number): Promise<QuestionDetailResponseType> {
    return this.get<QuestionDetailResponseType>({
      url: `/api/question/${id}`,
      responseSchema: QuestionDetailResponseSchema,
    });
  }

  async create(data: QuestionCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, QuestionCreateRequestType>({
      url: '/api/question',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: QuestionUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, QuestionUpdateRequestType>({
      url: `/api/question/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/question/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const questionService = new QuestionService();
