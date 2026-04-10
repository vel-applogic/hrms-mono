'use server';

import type {
  ExpenseCreateRequestType,
  ExpenseFilterRequestType,
  ExpenseResponseType,
  ExpenseSummaryResponseType,
  ExpenseUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { expenseService } from '@/lib/service/expense.service';

export async function searchExpenses(filterRequest: ExpenseFilterRequestType): Promise<PaginatedResponseType<ExpenseResponseType>> {
  return expenseService.search(filterRequest);
}

export async function createExpense(data: ExpenseCreateRequestType): Promise<ExpenseResponseType> {
  const result = await expenseService.create(data);
  revalidatePath('/expense');
  return result;
}

export async function updateExpense(id: number, data: ExpenseUpdateRequestType): Promise<ExpenseResponseType> {
  const result = await expenseService.update(id, data);
  revalidatePath('/expense');
  return result;
}

export async function getExpenseById(id: number): Promise<ExpenseResponseType> {
  return expenseService.getById(id);
}

export async function deleteExpense(id: number): Promise<OperationStatusResponseType> {
  const result = await expenseService.remove(id);
  revalidatePath('/expense');
  return result;
}

export async function getExpenseSummary(): Promise<ExpenseSummaryResponseType> {
  return expenseService.getSummary();
}
