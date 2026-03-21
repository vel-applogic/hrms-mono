'use server';

import type {
  EmployeeDeductionCreateRequestType,
  EmployeeDeductionFilterRequestType,
  EmployeeDeductionResponseType,
  EmployeeDeductionUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { employeeDeductionService } from '@/lib/service/employee-deduction.service';

export async function searchEmployeeDeductions(
  params: EmployeeDeductionFilterRequestType,
): Promise<PaginatedResponseType<EmployeeDeductionResponseType>> {
  return employeeDeductionService.search(params);
}

export async function createEmployeeDeduction(
  data: EmployeeDeductionCreateRequestType,
): Promise<EmployeeDeductionResponseType> {
  return employeeDeductionService.create(data);
}

export async function updateEmployeeDeduction(
  id: number,
  data: EmployeeDeductionUpdateRequestType,
): Promise<EmployeeDeductionResponseType> {
  return employeeDeductionService.update(id, data);
}

export async function deleteEmployeeDeduction(id: number, employeeId: number): Promise<OperationStatusResponseType> {
  const result = await employeeDeductionService.remove(id);
  revalidatePath('/employee');
  revalidatePath(`/employee/${employeeId}/deduction`);
  return result;
}
