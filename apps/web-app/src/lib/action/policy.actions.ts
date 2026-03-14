'use server';

import {
  OperationStatusResponseType,
  PaginatedResponseType,
  PolicyCreateRequestType,
  PolicyDetailResponseType,
  PolicyFilterRequestType,
  PolicyListResponseType,
  PolicyUpdateRequestType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { policyService } from '@/lib/service/policy.service';

export async function searchPolicies(filterRequest: PolicyFilterRequestType): Promise<PaginatedResponseType<PolicyListResponseType>> {
  return policyService.search(filterRequest);
}

export async function createPolicy(data: PolicyCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await policyService.create(data);
  revalidatePath('/policy');
  return result;
}

export async function updatePolicy(id: number, data: PolicyUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await policyService.update(id, data);
  revalidatePath('/policy');
  return result;
}

export async function getPolicyById(id: number): Promise<PolicyDetailResponseType> {
  return policyService.getById(id);
}

export async function deletePolicy(id: number): Promise<OperationStatusResponseType> {
  const result = await policyService.remove(id);
  revalidatePath('/policy');
  return result;
}
