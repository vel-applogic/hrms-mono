import type {
  CandidateFeedbackCreateRequestType,
  CandidateFeedbackFilterRequestType,
  CandidateFeedbackResponseType,
  CandidateFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  CandidateFeedbackResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class CandidateFeedbackService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: CandidateFeedbackFilterRequestType): Promise<PaginatedResponseType<CandidateFeedbackResponseType>> {
    return this.patch<PaginatedResponseType<CandidateFeedbackResponseType>, CandidateFeedbackFilterRequestType>({
      url: '/api/candidate-feedback/search',
      data: params,
      responseSchema: PaginatedResponseSchema(CandidateFeedbackResponseSchema),
    });
  }

  async create(data: CandidateFeedbackCreateRequestType): Promise<CandidateFeedbackResponseType> {
    return this.post<CandidateFeedbackResponseType, CandidateFeedbackCreateRequestType>({
      url: '/api/candidate-feedback',
      data,
      responseSchema: CandidateFeedbackResponseSchema,
    });
  }

  async update(id: number, data: CandidateFeedbackUpdateRequestType): Promise<CandidateFeedbackResponseType> {
    return this.put<CandidateFeedbackResponseType, CandidateFeedbackUpdateRequestType>({
      url: `/api/candidate-feedback/${id}`,
      data,
      responseSchema: CandidateFeedbackResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/candidate-feedback/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const candidateFeedbackService = new CandidateFeedbackService();
