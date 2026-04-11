'use server';

import type { BranchCreateRequestType, BranchResponseType, BranchUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { branchService } from '@/lib/service/branch.service';
import { ActionResult, extractActionError } from '@/lib/util/action-result';

export async function createBranch(data: BranchCreateRequestType): Promise<ActionResult<BranchResponseType>> {
  try {
    const result = await branchService.create(data);
    revalidatePath('/branch');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to create branch') };
  }
}

export async function updateBranch(id: number, data: BranchUpdateRequestType): Promise<ActionResult<BranchResponseType>> {
  try {
    const result = await branchService.update(id, data);
    revalidatePath('/branch');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to update branch') };
  }
}

export async function deleteBranch(id: number): Promise<OperationStatusResponseType> {
  const result = await branchService.remove(id);
  revalidatePath('/branch');
  return result;
}

export async function getBranchList(): Promise<BranchResponseType[]> {
  const result = await branchService.search({ pagination: { page: 1, limit: 500 } });
  return result.results;
}
