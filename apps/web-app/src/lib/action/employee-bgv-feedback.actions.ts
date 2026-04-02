'use server';

import type {
  EmployeeBgvFeedbackCreateRequestType,
  EmployeeBgvFeedbackFilterRequestType,
  EmployeeBgvFeedbackResponseType,
  EmployeeBgvFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { employeeBgvFeedbackService } from '@/lib/service/employee-bgv-feedback.service';

export async function searchEmployeeBgvFeedbacks(
  params: EmployeeBgvFeedbackFilterRequestType,
): Promise<PaginatedResponseType<EmployeeBgvFeedbackResponseType>> {
  return employeeBgvFeedbackService.search(params);
}

export async function createEmployeeBgvFeedback(
  data: EmployeeBgvFeedbackCreateRequestType,
): Promise<EmployeeBgvFeedbackResponseType> {
  const result = await employeeBgvFeedbackService.create(data);
  revalidatePath('/employee');
  revalidatePath(`/employee/${data.employeeId}/bgv`);
  return result;
}

export async function updateEmployeeBgvFeedback(
  id: number,
  data: EmployeeBgvFeedbackUpdateRequestType,
  employeeId: number,
): Promise<EmployeeBgvFeedbackResponseType> {
  const result = await employeeBgvFeedbackService.update(id, data);
  revalidatePath('/employee');
  revalidatePath(`/employee/${employeeId}/bgv`);
  return result;
}

export async function deleteEmployeeBgvFeedback(id: number, employeeId: number): Promise<OperationStatusResponseType> {
  const result = await employeeBgvFeedbackService.remove(id);
  revalidatePath('/employee');
  revalidatePath(`/employee/${employeeId}/bgv`);
  return result;
}
