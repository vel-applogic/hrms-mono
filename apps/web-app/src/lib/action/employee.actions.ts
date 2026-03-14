'use server';

import type {
  EmployeeCreateRequestType,
  EmployeeDetailResponseType,
  EmployeeListResponseType,
  EmployeeUpdateDocumentsRequestType,
  EmployeeUpdateRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { employeeService } from '@/lib/service/employee.service';

export async function createEmployee(data: EmployeeCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await employeeService.create(data);
  revalidatePath('/employee');
  return result;
}

export async function updateEmployee(id: number, data: EmployeeUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await employeeService.update(id, data);
  revalidatePath('/employee');
  revalidatePath(`/employee/${id}/details`);
  return result;
}

export async function updateEmployeeDocuments(
  id: number,
  data: EmployeeUpdateDocumentsRequestType,
): Promise<OperationStatusResponseType> {
  const result = await employeeService.updateDocuments(id, data);
  revalidatePath('/employee');
  revalidatePath(`/employee/${id}/documents`);
  return result;
}

export async function getEmployeeById(id: number): Promise<EmployeeDetailResponseType> {
  return employeeService.getById(id);
}

export async function deleteEmployee(id: number): Promise<OperationStatusResponseType> {
  const result = await employeeService.remove(id);
  revalidatePath('/employee');
  return result;
}

export async function getEmployeesList(): Promise<EmployeeListResponseType[]> {
  const result = await employeeService.search({ pagination: { page: 1, limit: 500 } });
  return result.results;
}
