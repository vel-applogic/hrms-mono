'use server';

import type { DepartmentCreateRequestType, DepartmentResponseType, DepartmentUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { departmentService } from '@/lib/service/department.service';
import { ActionResult, extractActionError } from '@/lib/util/action-result';

export async function createDepartment(data: DepartmentCreateRequestType): Promise<ActionResult<DepartmentResponseType>> {
  try {
    const result = await departmentService.create(data);
    revalidatePath('/department');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to create department') };
  }
}

export async function updateDepartment(id: number, data: DepartmentUpdateRequestType): Promise<ActionResult<DepartmentResponseType>> {
  try {
    const result = await departmentService.update(id, data);
    revalidatePath('/department');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to update department') };
  }
}

export async function deleteDepartment(id: number): Promise<OperationStatusResponseType> {
  const result = await departmentService.remove(id);
  revalidatePath('/department');
  return result;
}

export async function getDepartmentList(): Promise<DepartmentResponseType[]> {
  const result = await departmentService.search({ pagination: { page: 1, limit: 500 } });
  return result.results;
}
