import type {
  EmployeeCompensationCreateRequestType,
  EmployeeCompensationFilterRequestType,
  EmployeeCompensationResponseType,
  EmployeeCompensationUpdateRequestType,
  PaginatedResponseType,
  PayrollActiveCompensationFilterRequestType,
  PayrollActiveCompensationResponseType,
} from '@repo/dto';
import {
  EmployeeCompensationResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
  PayrollActiveCompensationResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class EmployeeCompensationService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: EmployeeCompensationFilterRequestType): Promise<PaginatedResponseType<EmployeeCompensationResponseType>> {
    return this.patch<PaginatedResponseType<EmployeeCompensationResponseType>, EmployeeCompensationFilterRequestType>({
      url: '/api/employee-compensation/search',
      data: params,
      responseSchema: PaginatedResponseSchema(EmployeeCompensationResponseSchema),
    });
  }

  async searchActiveAll(
    params: PayrollActiveCompensationFilterRequestType,
  ): Promise<PaginatedResponseType<PayrollActiveCompensationResponseType>> {
    return this.patch<
      PaginatedResponseType<PayrollActiveCompensationResponseType>,
      PayrollActiveCompensationFilterRequestType
    >({
      url: '/api/employee-compensation/search-active-all',
      data: params,
      responseSchema: PaginatedResponseSchema(PayrollActiveCompensationResponseSchema),
    });
  }

  async create(data: EmployeeCompensationCreateRequestType): Promise<EmployeeCompensationResponseType> {
    return this.post<EmployeeCompensationResponseType, EmployeeCompensationCreateRequestType>({
      url: '/api/employee-compensation',
      data,
      responseSchema: EmployeeCompensationResponseSchema,
    });
  }

  async update(id: number, data: EmployeeCompensationUpdateRequestType): Promise<EmployeeCompensationResponseType> {
    return this.put<EmployeeCompensationResponseType, EmployeeCompensationUpdateRequestType>({
      url: `/api/employee-compensation/${id}`,
      data,
      responseSchema: EmployeeCompensationResponseSchema,
    });
  }

  async remove(id: number) {
    return this.delete<{ success: boolean }>({
      url: `/api/employee-compensation/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const employeeCompensationService = new EmployeeCompensationService();
