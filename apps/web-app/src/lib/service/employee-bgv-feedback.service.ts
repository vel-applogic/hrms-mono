import type {
  EmployeeBgvFeedbackCreateRequestType,
  EmployeeBgvFeedbackFilterRequestType,
  EmployeeBgvFeedbackResponseType,
  EmployeeBgvFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  EmployeeBgvFeedbackResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class EmployeeBgvFeedbackService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: EmployeeBgvFeedbackFilterRequestType): Promise<PaginatedResponseType<EmployeeBgvFeedbackResponseType>> {
    return this.patch<PaginatedResponseType<EmployeeBgvFeedbackResponseType>, EmployeeBgvFeedbackFilterRequestType>({
      url: '/api/employee-bgv-feedback/search',
      data: params,
      responseSchema: PaginatedResponseSchema(EmployeeBgvFeedbackResponseSchema),
    });
  }

  async create(data: EmployeeBgvFeedbackCreateRequestType): Promise<EmployeeBgvFeedbackResponseType> {
    return this.post<EmployeeBgvFeedbackResponseType, EmployeeBgvFeedbackCreateRequestType>({
      url: '/api/employee-bgv-feedback',
      data,
      responseSchema: EmployeeBgvFeedbackResponseSchema,
    });
  }

  async update(id: number, data: EmployeeBgvFeedbackUpdateRequestType): Promise<EmployeeBgvFeedbackResponseType> {
    return this.put<EmployeeBgvFeedbackResponseType, EmployeeBgvFeedbackUpdateRequestType>({
      url: `/api/employee-bgv-feedback/${id}`,
      data,
      responseSchema: EmployeeBgvFeedbackResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/employee-bgv-feedback/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const employeeBgvFeedbackService = new EmployeeBgvFeedbackService();
