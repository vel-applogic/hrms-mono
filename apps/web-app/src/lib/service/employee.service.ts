import {
  EmployeeCreateRequestType,
  EmployeeDetailResponseSchema,
  EmployeeDetailResponseType,
  EmployeeFilterRequestType,
  EmployeeListResponseSchema,
  EmployeeListResponseType,
  EmployeeUpdateDocumentsRequestType,
  EmployeeUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class EmployeeService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: EmployeeFilterRequestType): Promise<PaginatedResponseType<EmployeeListResponseType>> {
    return this.patch<PaginatedResponseType<EmployeeListResponseType>, EmployeeFilterRequestType>({
      url: '/api/employee/search',
      data: params,
      responseSchema: PaginatedResponseSchema(EmployeeListResponseSchema),
    });
  }

  async getById(id: number): Promise<EmployeeDetailResponseType> {
    return this.get<EmployeeDetailResponseType>({
      url: `/api/employee/${id}`,
      responseSchema: EmployeeDetailResponseSchema,
    });
  }

  async create(data: EmployeeCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, EmployeeCreateRequestType>({
      url: '/api/employee',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: EmployeeUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, EmployeeUpdateRequestType>({
      url: `/api/employee/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/employee/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async updateDocuments(id: number, data: EmployeeUpdateDocumentsRequestType): Promise<OperationStatusResponseType> {
    return this.patch<OperationStatusResponseType, EmployeeUpdateDocumentsRequestType>({
      url: `/api/employee/${id}/documents`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const employeeService = new EmployeeService();
