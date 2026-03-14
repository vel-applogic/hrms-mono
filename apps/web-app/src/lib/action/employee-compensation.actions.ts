'use server';

import type {
  EmployeeCompensationCreateRequestType,
  EmployeeCompensationFilterRequestType,
  EmployeeCompensationResponseType,
  EmployeeCompensationUpdateRequestType,
  PaginatedResponseType,
} from '@repo/dto';

import { employeeCompensationService } from '@/lib/service/employee-compensation.service';

export async function searchEmployeeCompensations(
  params: EmployeeCompensationFilterRequestType,
): Promise<PaginatedResponseType<EmployeeCompensationResponseType>> {
  return employeeCompensationService.search(params);
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
