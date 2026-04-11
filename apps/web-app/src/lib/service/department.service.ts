import {
  DepartmentCreateRequestType,
  DepartmentFilterRequestType,
  DepartmentResponseSchema,
  DepartmentResponseType,
  DepartmentUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class DepartmentService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: DepartmentFilterRequestType): Promise<PaginatedResponseType<DepartmentResponseType>> {
    return this.patch<PaginatedResponseType<DepartmentResponseType>, DepartmentFilterRequestType>({
      url: '/api/department/search',
      data: params,
      responseSchema: PaginatedResponseSchema(DepartmentResponseSchema),
    });
  }

  async getById(id: number): Promise<DepartmentResponseType> {
    return this.get<DepartmentResponseType>({
      url: `/api/department/${id}`,
      responseSchema: DepartmentResponseSchema,
    });
  }

  async create(data: DepartmentCreateRequestType): Promise<DepartmentResponseType> {
    return this.post<DepartmentResponseType, DepartmentCreateRequestType>({
      url: '/api/department',
      data,
      responseSchema: DepartmentResponseSchema,
    });
  }

  async update(id: number, data: DepartmentUpdateRequestType): Promise<DepartmentResponseType> {
    return this.put<DepartmentResponseType, DepartmentUpdateRequestType>({
      url: `/api/department/${id}`,
      data,
      responseSchema: DepartmentResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/department/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const departmentService = new DepartmentService();
