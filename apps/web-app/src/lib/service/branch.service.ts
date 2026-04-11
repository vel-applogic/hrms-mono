import {
  BranchCreateRequestType,
  BranchFilterRequestType,
  BranchResponseSchema,
  BranchResponseType,
  BranchUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class BranchService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: BranchFilterRequestType): Promise<PaginatedResponseType<BranchResponseType>> {
    return this.patch<PaginatedResponseType<BranchResponseType>, BranchFilterRequestType>({
      url: '/api/branch/search',
      data: params,
      responseSchema: PaginatedResponseSchema(BranchResponseSchema),
    });
  }

  async getById(id: number): Promise<BranchResponseType> {
    return this.get<BranchResponseType>({
      url: `/api/branch/${id}`,
      responseSchema: BranchResponseSchema,
    });
  }

  async create(data: BranchCreateRequestType): Promise<BranchResponseType> {
    return this.post<BranchResponseType, BranchCreateRequestType>({
      url: '/api/branch',
      data,
      responseSchema: BranchResponseSchema,
    });
  }

  async update(id: number, data: BranchUpdateRequestType): Promise<BranchResponseType> {
    return this.put<BranchResponseType, BranchUpdateRequestType>({
      url: `/api/branch/${id}`,
      data,
      responseSchema: BranchResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/branch/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const branchService = new BranchService();
