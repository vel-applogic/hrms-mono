import type {
  EmployeeFeedbackCreateRequestType,
  EmployeeFeedbackFilterRequestType,
  EmployeeFeedbackResponseType,
  EmployeeFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeFeedbackResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class EmployeeFeedbackService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: EmployeeFeedbackFilterRequestType): Promise<PaginatedResponseType<EmployeeFeedbackResponseType>> {
    return this.patch<PaginatedResponseType<EmployeeFeedbackResponseType>, EmployeeFeedbackFilterRequestType>({
      url: '/api/employee-feedback/search',
      data: params,
      responseSchema: PaginatedResponseSchema(EmployeeFeedbackResponseSchema),
    });
  }

  async create(data: EmployeeFeedbackCreateRequestType): Promise<EmployeeFeedbackResponseType> {
    return this.post<EmployeeFeedbackResponseType, EmployeeFeedbackCreateRequestType>({
      url: '/api/employee-feedback',
      data,
      responseSchema: EmployeeFeedbackResponseSchema,
    });
  }

  async update(id: number, data: EmployeeFeedbackUpdateRequestType): Promise<EmployeeFeedbackResponseType> {
    return this.put<EmployeeFeedbackResponseType, EmployeeFeedbackUpdateRequestType>({
      url: `/api/employee-feedback/${id}`,
      data,
      responseSchema: EmployeeFeedbackResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/employee-feedback/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const employeeFeedbackService = new EmployeeFeedbackService();
