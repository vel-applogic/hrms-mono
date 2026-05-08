'use server';

import type {
  CountryResponseType,
  CurrencyResponseType,
  OrganisationCreateRequestType,
  OrganisationDetailResponseType,
  OrganisationResponseType,
  OrganisationUpdateRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { organisationService } from '@/lib/service/organisation.service';
import { ActionResult, extractActionError } from '@/lib/util/action-result';

export async function listCurrencies(): Promise<CurrencyResponseType[]> {
  return organisationService.listCurrencies();
}

export async function listCountries(): Promise<CountryResponseType[]> {
  return organisationService.listCountries();
}

export async function getOrganisationById(id: number): Promise<ActionResult<OrganisationDetailResponseType>> {
  try {
    const result = await organisationService.getById(id);
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to get organisation') };
  }
}

export async function createOrganisation(data: OrganisationCreateRequestType): Promise<ActionResult<OrganisationResponseType>> {
  try {
    const result = await organisationService.create(data);
    revalidatePath('/organisation');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to create organisation') };
  }
}

export async function updateOrganisation(id: number, data: OrganisationUpdateRequestType): Promise<ActionResult<OrganisationResponseType>> {
  try {
    const result = await organisationService.update(id, data);
    revalidatePath('/organisation');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to update organisation') };
  }
}

export async function deleteOrganisation(id: number): Promise<ActionResult<OperationStatusResponseType>> {
  try {
    const result = await organisationService.remove(id);
    revalidatePath('/organisation');
    return { ok: true, data: result };
  } catch (err) {
    return { ok: false, error: extractActionError(err, 'Failed to delete organisation') };
  }
}
