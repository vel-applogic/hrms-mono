'use server';

import type {
  LeaveCreateRequestType,
  LeaveFilterRequestType,
  LeaveResponseType,
  LeaveUpdateRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { leaveService } from '@/lib/service/leave.service';

export async function searchLeaves(filter: LeaveFilterRequestType): Promise<PaginatedResponseType<LeaveResponseType>> {
  return leaveService.search(filter);
}

export async function createLeave(data: LeaveCreateRequestType): Promise<LeaveResponseType> {
  const result = await leaveService.create(data);
  revalidatePath('/leaves');
  return result;
}

export async function updateLeave(id: number, data: LeaveUpdateRequestType): Promise<LeaveResponseType> {
  const result = await leaveService.update(id, data);
  revalidatePath('/leaves');
  return result;
}

export async function cancelLeave(id: number): Promise<LeaveResponseType> {
  const result = await leaveService.cancel(id);
  revalidatePath('/leaves');
  return result;
}

export async function approveLeave(id: number): Promise<LeaveResponseType> {
  const result = await leaveService.approve(id);
  revalidatePath('/leaves');
  return result;
}

export async function rejectLeave(id: number): Promise<LeaveResponseType> {
  const result = await leaveService.reject(id);
  revalidatePath('/leaves');
  return result;
}
