import {
  CandidateCreateRequestType,
  CandidateDetailResponseSchema,
  CandidateDetailResponseType,
  CandidateFilterRequestType,
  CandidateListResponseSchema,
  CandidateListResponseType,
  CandidateUpdateProgressRequestType,
  CandidateUpdateRequestType,
  CandidateUpdateStatusRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class CandidateService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: CandidateFilterRequestType): Promise<PaginatedResponseType<CandidateListResponseType>> {
    return this.patch<PaginatedResponseType<CandidateListResponseType>, CandidateFilterRequestType>({
      url: '/api/candidate/search',
      data: params,
      responseSchema: PaginatedResponseSchema(CandidateListResponseSchema),
    });
  }

  async getById(id: number): Promise<CandidateDetailResponseType> {
    return this.get<CandidateDetailResponseType>({
      url: `/api/candidate/${id}`,
      responseSchema: CandidateDetailResponseSchema,
    });
  }

  async create(data: CandidateCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, CandidateCreateRequestType>({
      url: '/api/candidate',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: CandidateUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, CandidateUpdateRequestType>({
      url: `/api/candidate/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/candidate/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async updateStatus(id: number, status: CandidateUpdateStatusRequestType['status']): Promise<OperationStatusResponseType> {
    return this.patch<OperationStatusResponseType, { status: CandidateUpdateStatusRequestType['status'] }>({
      url: `/api/candidate/${id}/status`,
      data: { status },
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async updateProgress(id: number, progress: CandidateUpdateProgressRequestType['progress']): Promise<OperationStatusResponseType> {
    return this.patch<OperationStatusResponseType, { progress: CandidateUpdateProgressRequestType['progress'] }>({
      url: `/api/candidate/${id}/progress`,
      data: { progress },
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const candidateService = new CandidateService();
