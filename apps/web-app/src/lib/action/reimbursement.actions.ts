'use server';

import type {
  ReimbursementAddFeedbackRequestType,
  ReimbursementCreateRequestType,
  ReimbursementDetailResponseType,
  ReimbursementFilterRequestType,
  ReimbursementResponseType,
  ReimbursementUpdateStatusRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { reimbursementService } from '@/lib/service/reimbursement.service';

export async function searchReimbursements(filter: ReimbursementFilterRequestType): Promise<PaginatedResponseType<ReimbursementResponseType>> {
  return reimbursementService.search(filter);
}

export async function getReimbursementById(id: number): Promise<ReimbursementDetailResponseType> {
  return reimbursementService.getById(id);
}

export async function createReimbursement(data: ReimbursementCreateRequestType): Promise<ReimbursementResponseType> {
  const result = await reimbursementService.create(data);
  revalidatePath('/reimbursement', 'layout');
  revalidatePath('/emp/reimbursement', 'layout');
  return result;
}

export async function updateReimbursementStatus(id: number, data: ReimbursementUpdateStatusRequestType): Promise<ReimbursementResponseType> {
  const result = await reimbursementService.updateStatus(id, data);
  revalidatePath('/reimbursement', 'layout');
  revalidatePath('/emp/reimbursement', 'layout');
  return result;
}

export async function addReimbursementFeedback(id: number, data: ReimbursementAddFeedbackRequestType): Promise<ReimbursementDetailResponseType> {
  const result = await reimbursementService.addFeedback(id, data);
  revalidatePath('/reimbursement', 'layout');
  revalidatePath('/emp/reimbursement', 'layout');
  return result;
}

export async function updateReimbursementFeedback(id: number, feedbackId: number, data: ReimbursementAddFeedbackRequestType): Promise<ReimbursementDetailResponseType> {
  const result = await reimbursementService.updateFeedback(id, feedbackId, data);
  revalidatePath('/reimbursement', 'layout');
  revalidatePath('/emp/reimbursement', 'layout');
  return result;
}

export async function deleteReimbursementFeedback(id: number, feedbackId: number): Promise<OperationStatusResponseType> {
  const result = await reimbursementService.deleteFeedback(id, feedbackId);
  revalidatePath('/reimbursement', 'layout');
  revalidatePath('/emp/reimbursement', 'layout');
  return result;
}
