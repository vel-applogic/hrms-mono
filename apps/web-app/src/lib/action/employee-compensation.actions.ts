'use server';

import type {
  EmployeeCompensationCreateRequestType,
  EmployeeCompensationFilterRequestType,
  EmployeeCompensationResponseType,
  EmployeeCompensationUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
  PayrollActiveCompensationFilterRequestType,
  PayrollActiveCompensationResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { employeeCompensationService } from '@/lib/service/employee-compensation.service';

export async function searchEmployeeCompensations(
  params: EmployeeCompensationFilterRequestType,
): Promise<PaginatedResponseType<EmployeeCompensationResponseType>> {
  return employeeCompensationService.search(params);
}

export async function searchPayrollActiveCompensations(
  params: PayrollActiveCompensationFilterRequestType,
): Promise<PaginatedResponseType<PayrollActiveCompensationResponseType>> {
  return employeeCompensationService.searchActiveAll(params);
}

export async function createEmployeeCompensation(
  data: EmployeeCompensationCreateRequestType,
): Promise<EmployeeCompensationResponseType> {
  return employeeCompensationService.create(data);
}

export async function updateEmployeeCompensation(
  id: number,
  data: EmployeeCompensationUpdateRequestType,
): Promise<EmployeeCompensationResponseType> {
  return employeeCompensationService.update(id, data);
}

export async function deleteEmployeeCompensation(id: number, employeeId: number): Promise<OperationStatusResponseType> {
  const result = await employeeCompensationService.remove(id);
  revalidatePath('/employee');
  revalidatePath(`/employee/${employeeId}/compensation`);
  return result;
}
