'use server';

import type {
  EmployeeFeedbackCreateRequestType,
  EmployeeFeedbackFilterRequestType,
  EmployeeFeedbackResponseType,
  EmployeeFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { employeeFeedbackService } from '@/lib/service/employee-feedback.service';

export async function searchEmployeeFeedbacks(
  params: EmployeeFeedbackFilterRequestType,
): Promise<PaginatedResponseType<EmployeeFeedbackResponseType>> {
  return employeeFeedbackService.search(params);
}

export async function createEmployeeFeedback(
  data: EmployeeFeedbackCreateRequestType,
): Promise<EmployeeFeedbackResponseType> {
  const result = await employeeFeedbackService.create(data);
  revalidatePath('/employee');
  revalidatePath(`/employee/${data.employeeId}/feedbacks`);
  return result;
}

export async function updateEmployeeFeedback(
  id: number,
  data: EmployeeFeedbackUpdateRequestType,
  employeeId: number,
): Promise<EmployeeFeedbackResponseType> {
  const result = await employeeFeedbackService.update(id, data);
  revalidatePath('/employee');
  revalidatePath(`/employee/${employeeId}/feedbacks`);
  return result;
}

export async function deleteEmployeeFeedback(id: number, employeeId: number): Promise<OperationStatusResponseType> {
  const result = await employeeFeedbackService.remove(id);
  revalidatePath('/employee');
  revalidatePath(`/employee/${employeeId}/feedbacks`);
  return result;
}
