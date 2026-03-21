import type {
  EmployeeDeductionCreateRequestType,
  EmployeeDeductionFilterRequestType,
  EmployeeDeductionResponseType,
  EmployeeDeductionUpdateRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeDeductionResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class EmployeeDeductionService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: EmployeeDeductionFilterRequestType): Promise<PaginatedResponseType<EmployeeDeductionResponseType>> {
    return this.patch<PaginatedResponseType<EmployeeDeductionResponseType>, EmployeeDeductionFilterRequestType>({
      url: '/api/employee-deduction/search',
      data: params,
      responseSchema: PaginatedResponseSchema(EmployeeDeductionResponseSchema),
    });
  }

  async create(data: EmployeeDeductionCreateRequestType): Promise<EmployeeDeductionResponseType> {
    return this.post<EmployeeDeductionResponseType, EmployeeDeductionCreateRequestType>({
      url: '/api/employee-deduction',
      data,
      responseSchema: EmployeeDeductionResponseSchema,
    });
  }

  async update(id: number, data: EmployeeDeductionUpdateRequestType): Promise<EmployeeDeductionResponseType> {
    return this.put<EmployeeDeductionResponseType, EmployeeDeductionUpdateRequestType>({
      url: `/api/employee-deduction/${id}`,
      data,
      responseSchema: EmployeeDeductionResponseSchema,
    });
  }

  async remove(id: number) {
    return this.delete<{ success: boolean }>({
      url: `/api/employee-deduction/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const employeeDeductionService = new EmployeeDeductionService();
