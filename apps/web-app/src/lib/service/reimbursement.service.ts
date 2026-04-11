import type {
  CountResponseType,
  OperationStatusResponseType,
  PaginatedResponseType,
  ReimbursementAddFeedbackRequestType,
  ReimbursementCreateRequestType,
  ReimbursementDetailResponseType,
  ReimbursementFilterRequestType,
  ReimbursementResponseType,
  ReimbursementUpdateStatusRequestType,
} from '@repo/dto';
import { CountResponseSchema, OperationStatusResponseSchema, PaginatedResponseSchema, ReimbursementDetailResponseSchema, ReimbursementResponseSchema } from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class ReimbursementService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: ReimbursementFilterRequestType): Promise<PaginatedResponseType<ReimbursementResponseType>> {
    return this.patch<PaginatedResponseType<ReimbursementResponseType>, ReimbursementFilterRequestType>({
      url: '/api/reimbursement/search',
      data: params,
      responseSchema: PaginatedResponseSchema(ReimbursementResponseSchema),
    });
  }

  async getById(id: number): Promise<ReimbursementDetailResponseType> {
    return this.get<ReimbursementDetailResponseType>({
      url: `/api/reimbursement/${id}`,
      responseSchema: ReimbursementDetailResponseSchema,
    });
  }

  async create(data: ReimbursementCreateRequestType): Promise<ReimbursementResponseType> {
    return this.post<ReimbursementResponseType, ReimbursementCreateRequestType>({
      url: '/api/reimbursement',
      data,
      responseSchema: ReimbursementResponseSchema,
    });
  }

  async updateStatus(id: number, data: ReimbursementUpdateStatusRequestType): Promise<ReimbursementResponseType> {
    return this.post<ReimbursementResponseType, ReimbursementUpdateStatusRequestType>({
      url: `/api/reimbursement/${id}/status`,
      data,
      responseSchema: ReimbursementResponseSchema,
    });
  }

  async addFeedback(id: number, data: ReimbursementAddFeedbackRequestType): Promise<ReimbursementDetailResponseType> {
    return this.post<ReimbursementDetailResponseType, ReimbursementAddFeedbackRequestType>({
      url: `/api/reimbursement/${id}/feedback`,
      data,
      responseSchema: ReimbursementDetailResponseSchema,
    });
  }

  async updateFeedback(id: number, feedbackId: number, data: ReimbursementAddFeedbackRequestType): Promise<ReimbursementDetailResponseType> {
    return this.put<ReimbursementDetailResponseType, ReimbursementAddFeedbackRequestType>({
      url: `/api/reimbursement/${id}/feedback/${feedbackId}`,
      data,
      responseSchema: ReimbursementDetailResponseSchema,
    });
  }

  async deleteFeedback(id: number, feedbackId: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/reimbursement/${id}/feedback/${feedbackId}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async pendingCount(): Promise<CountResponseType> {
    return this.get<CountResponseType>({
      url: '/api/reimbursement/pending-count',
      responseSchema: CountResponseSchema,
    });
  }
}

export const reimbursementService = new ReimbursementService();
