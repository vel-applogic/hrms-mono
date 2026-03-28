'use server';

import type {
  OrganizationCreateRequestType,
  OrganizationDetailResponseType,
  OrganizationResponseType,
  OrganizationUpdateRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { organizationService } from '@/lib/service/organization.service';
import { ActionResult, extractActionError } from '@/lib/util/action-result';

export async function getOrganizationById(id: number): Promise<ActionResult<OrganizationDetailResponseType>> {
  try {
    const result = await organizationService.getById(id);
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to get organization') };
  }
}

export async function createOrganization(data: OrganizationCreateRequestType): Promise<ActionResult<OrganizationResponseType>> {
  try {
    const result = await organizationService.create(data);
    revalidatePath('/organization');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to create organization') };
  }
}

export async function updateOrganization(id: number, data: OrganizationUpdateRequestType): Promise<ActionResult<OrganizationResponseType>> {
  try {
    const result = await organizationService.update(id, data);
    revalidatePath('/organization');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to update organization') };
  }
}

export async function deleteOrganization(id: number): Promise<ActionResult<OperationStatusResponseType>> {
  try {
    const result = await organizationService.remove(id);
    revalidatePath('/organization');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to delete organization') };
  }
}
