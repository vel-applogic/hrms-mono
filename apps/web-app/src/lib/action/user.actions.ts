'use server';

import { OperationStatusResponseType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { userService } from '@/lib/service/user.service';

export async function blockUser(id: number): Promise<OperationStatusResponseType> {
  const result = await userService.block(id);
  revalidatePath('/user');
  return result;
}

export async function unblockUser(id: number): Promise<OperationStatusResponseType> {
  const result = await userService.unblock(id);
  revalidatePath('/user');
  return result;
}

export async function upgradeUserPlan(id: number): Promise<OperationStatusResponseType> {
  const result = await userService.upgradePlan(id);
  revalidatePath('/user');
  return result;
}

export async function downgradeUserPlan(id: number): Promise<OperationStatusResponseType> {
  const result = await userService.downgradePlan(id);
  revalidatePath('/user');
  return result;
}
