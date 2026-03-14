'use server';

import type {
  CandidateCreateRequestType,
  CandidateDetailResponseType,
  CandidateListResponseType,
  CandidateUpdateDocumentsRequestType,
  CandidateUpdateProgressRequestType,
  CandidateUpdateRequestType,
  CandidateUpdateStatusRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { candidateService } from '@/lib/service/candidate.service';

export async function createCandidate(data: CandidateCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await candidateService.create(data);
  revalidatePath('/candidate');
  return result;
}

export async function updateCandidate(id: number, data: CandidateUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await candidateService.update(id, data);
  revalidatePath('/candidate');
  revalidatePath(`/candidate/${id}/basic`);
  return result;
}

export async function updateCandidateStatus(
  id: number,
  status: CandidateUpdateStatusRequestType['status'],
): Promise<OperationStatusResponseType> {
  const result = await candidateService.updateStatus(id, status);
  revalidatePath('/candidate');
  return result;
}

export async function updateCandidateDocuments(
  id: number,
  data: CandidateUpdateDocumentsRequestType,
): Promise<OperationStatusResponseType> {
  const result = await candidateService.updateDocuments(id, data);
  revalidatePath('/candidate');
  revalidatePath(`/candidate/${id}/documents`);
  return result;
}

export async function updateCandidateProgress(
  id: number,
  progress: CandidateUpdateProgressRequestType['progress'],
): Promise<OperationStatusResponseType> {
  const result = await candidateService.updateProgress(id, progress);
  revalidatePath('/candidate');
  return result;
}

export async function getCandidateById(id: number): Promise<CandidateDetailResponseType> {
  return candidateService.getById(id);
}

export async function deleteCandidate(id: number): Promise<OperationStatusResponseType> {
  const result = await candidateService.remove(id);
  revalidatePath('/candidate');
  return result;
}

export async function getCandidatesList(): Promise<CandidateListResponseType[]> {
  const result = await candidateService.search({ pagination: { page: 1, limit: 500 } });
  return result.results;
}
