'use server';

import type {
  PayslipDetailResponseType,
  PayslipFilterRequestType,
  PayslipGenerateRequestType,
  PayslipGenerateResponseType,
  PayslipListResponseType,
  PayslipUpdateLineItemsRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { payslipService } from '@/lib/service/payslip.service';

export async function searchPayslips(
  params: PayslipFilterRequestType,
): Promise<PaginatedResponseType<PayslipListResponseType>> {
  return payslipService.search(params);
}

export async function generatePayslips(data: PayslipGenerateRequestType): Promise<PayslipGenerateResponseType> {
  const result = await payslipService.generate(data);
  revalidatePath('/payroll/payslip');
  return result;
}

export async function getPayslipById(id: number): Promise<PayslipDetailResponseType> {
  return payslipService.getById(id);
}

export async function updatePayslipLineItems(
  id: number,
  data: PayslipUpdateLineItemsRequestType,
): Promise<PayslipDetailResponseType> {
  const result = await payslipService.updateLineItems(id, data);
  revalidatePath('/payroll/payslip');
  return result;
}
