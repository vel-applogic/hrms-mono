'use server';

import { OperationStatusResponseType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { userService } from '@/lib/service/user.service';

export async function createUser(data: Parameters<typeof userService.create>[0]): Promise<OperationStatusResponseType> {
  const result = await userService.create(data);
  revalidatePath('/user');
  return result;
}

export async function updateUser(id: number, data: Parameters<typeof userService.update>[1]): Promise<OperationStatusResponseType> {
  const result = await userService.update(id, data);
  revalidatePath('/user');
  return result;
}
