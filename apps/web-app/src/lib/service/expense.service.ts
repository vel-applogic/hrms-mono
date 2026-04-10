import {
  ExpenseCreateRequestType,
  ExpenseFilterRequestType,
  ExpenseResponseSchema,
  ExpenseResponseType,
  ExpenseSummaryResponseSchema,
  ExpenseSummaryResponseType,
  ExpenseUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class ExpenseService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: ExpenseFilterRequestType): Promise<PaginatedResponseType<ExpenseResponseType>> {
    return this.patch<PaginatedResponseType<ExpenseResponseType>, ExpenseFilterRequestType>({
      url: '/api/expense/search',
      data: params,
      responseSchema: PaginatedResponseSchema(ExpenseResponseSchema),
    });
  }

  async getById(id: number): Promise<ExpenseResponseType> {
    return this.get<ExpenseResponseType>({
      url: `/api/expense/${id}`,
      responseSchema: ExpenseResponseSchema,
    });
  }

  async create(data: ExpenseCreateRequestType): Promise<ExpenseResponseType> {
    return this.post<ExpenseResponseType, ExpenseCreateRequestType>({
      url: '/api/expense',
      data,
      responseSchema: ExpenseResponseSchema,
    });
  }

  async update(id: number, data: ExpenseUpdateRequestType): Promise<ExpenseResponseType> {
    return this.put<ExpenseResponseType, ExpenseUpdateRequestType>({
      url: `/api/expense/${id}`,
      data,
      responseSchema: ExpenseResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/expense/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async getSummary(): Promise<ExpenseSummaryResponseType> {
    return this.get<ExpenseSummaryResponseType>({
      url: '/api/expense/summary',
      responseSchema: ExpenseSummaryResponseSchema,
    });
  }
}

export const expenseService = new ExpenseService();
