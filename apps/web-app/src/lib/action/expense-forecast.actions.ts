'use server';

import type {
  ExpenseForecastBulkSaveRequestType,
  ExpenseForecastResponseType,
  ExpenseForecastSummaryResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { expenseForecastService } from '@/lib/service/expense-forecast.service';

export async function getExpenseForecasts(): Promise<ExpenseForecastResponseType[]> {
  return expenseForecastService.list();
}

export async function getExpenseForecastSummary(): Promise<ExpenseForecastSummaryResponseType> {
  return expenseForecastService.summary();
}

export async function bulkSaveExpenseForecasts(data: ExpenseForecastBulkSaveRequestType): Promise<ExpenseForecastResponseType[]> {
  const result = await expenseForecastService.bulkSave(data);
  revalidatePath('/expense');
  return result;
}
