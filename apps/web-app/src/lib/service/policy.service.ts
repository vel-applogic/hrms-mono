import {
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
  PolicyCreateRequestType,
  PolicyDetailResponseSchema,
  PolicyDetailResponseType,
  PolicyFilterRequestType,
  PolicyListResponseSchema,
  PolicyListResponseType,
  PolicyUpdateRequestType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class PolicyService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: PolicyFilterRequestType): Promise<PaginatedResponseType<PolicyListResponseType>> {
    return this.patch<PaginatedResponseType<PolicyListResponseType>, PolicyFilterRequestType>({
      url: '/api/policy/search',
      data: params,
      responseSchema: PaginatedResponseSchema(PolicyListResponseSchema),
    });
  }

  async getById(id: number): Promise<PolicyDetailResponseType> {
    return this.get<PolicyDetailResponseType>({
      url: `/api/policy/${id}`,
      responseSchema: PolicyDetailResponseSchema,
    });
  }

  async create(data: PolicyCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, PolicyCreateRequestType>({
      url: '/api/policy',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: PolicyUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, PolicyUpdateRequestType>({
      url: `/api/policy/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/policy/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const policyService = new PolicyService();
