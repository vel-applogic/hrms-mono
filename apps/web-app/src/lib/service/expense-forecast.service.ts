import {
  ExpenseForecastBulkSaveRequestType,
  ExpenseForecastResponseSchema,
  ExpenseForecastResponseType,
  ExpenseForecastSummaryResponseSchema,
  ExpenseForecastSummaryResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';
import { z } from 'zod';

import { BaseService } from './_base.service';

class ExpenseForecastService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async list(): Promise<ExpenseForecastResponseType[]> {
    return this.get<ExpenseForecastResponseType[]>({
      url: '/api/expense-forecast',
      responseSchema: z.array(ExpenseForecastResponseSchema),
    });
  }

  async summary(): Promise<ExpenseForecastSummaryResponseType> {
    return this.get<ExpenseForecastSummaryResponseType>({
      url: '/api/expense-forecast/summary',
      responseSchema: ExpenseForecastSummaryResponseSchema,
    });
  }

  async bulkSave(data: ExpenseForecastBulkSaveRequestType): Promise<ExpenseForecastResponseType[]> {
    return this.put<ExpenseForecastResponseType[], ExpenseForecastBulkSaveRequestType>({
      url: '/api/expense-forecast/bulk',
      data,
      responseSchema: z.array(ExpenseForecastResponseSchema),
    });
  }
}

export const expenseForecastService = new ExpenseForecastService();
