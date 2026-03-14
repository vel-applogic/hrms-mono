'use server';

import type {
  CandidateFeedbackCreateRequestType,
  CandidateFeedbackFilterRequestType,
  CandidateFeedbackResponseType,
  CandidateFeedbackUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { candidateFeedbackService } from '@/lib/service/candidate-feedback.service';

export async function searchCandidateFeedbacks(
  params: CandidateFeedbackFilterRequestType,
): Promise<PaginatedResponseType<CandidateFeedbackResponseType>> {
  return candidateFeedbackService.search(params);
}

export async function createCandidateFeedback(
  data: CandidateFeedbackCreateRequestType,
): Promise<CandidateFeedbackResponseType> {
  const result = await candidateFeedbackService.create(data);
  revalidatePath('/candidate');
  revalidatePath(`/candidate/${data.candidateId}/feedbacks`);
  return result;
}

export async function updateCandidateFeedback(
  id: number,
  data: CandidateFeedbackUpdateRequestType,
  candidateId: number,
): Promise<CandidateFeedbackResponseType> {
  const result = await candidateFeedbackService.update(id, data);
  revalidatePath('/candidate');
  revalidatePath(`/candidate/${candidateId}/feedbacks`);
  return result;
}

export async function deleteCandidateFeedback(id: number, candidateId: number): Promise<OperationStatusResponseType> {
  const result = await candidateFeedbackService.remove(id);
  revalidatePath('/candidate');
  revalidatePath(`/candidate/${candidateId}/feedbacks`);
  return result;
}
