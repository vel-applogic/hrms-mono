import type {
  PayslipDetailResponseType,
  PayslipFilterRequestType,
  PayslipGenerateRequestType,
  PayslipGenerateResponseType,
  PayslipListResponseType,
  PayslipUpdateLineItemsRequestType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  PayslipDetailResponseSchema,
  PayslipGenerateResponseSchema,
  PayslipListResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { z } from 'zod';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class PayslipService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: PayslipFilterRequestType): Promise<PaginatedResponseType<PayslipListResponseType>> {
    return this.patch<PaginatedResponseType<PayslipListResponseType>, PayslipFilterRequestType>({
      url: '/api/payslip/search',
      data: params,
      responseSchema: PaginatedResponseSchema(PayslipListResponseSchema),
    });
  }

  async generate(data: PayslipGenerateRequestType): Promise<PayslipGenerateResponseType> {
    return this.post<PayslipGenerateResponseType, PayslipGenerateRequestType>({
      url: '/api/payslip/generate',
      data,
      responseSchema: PayslipGenerateResponseSchema,
    });
  }

  async getById(id: number): Promise<PayslipDetailResponseType> {
    return this.get<PayslipDetailResponseType>({
      url: `/api/payslip/${id}`,
      responseSchema: PayslipDetailResponseSchema,
    });
  }

  async updateLineItems(id: number, data: PayslipUpdateLineItemsRequestType): Promise<PayslipDetailResponseType> {
    return this.put<PayslipDetailResponseType, PayslipUpdateLineItemsRequestType>({
      url: `/api/payslip/${id}/line-items`,
      data,
      responseSchema: PayslipDetailResponseSchema,
    });
  }

  async getPdfSignedUrl(id: number): Promise<string> {
    const result = await this.get<{ signedUrl: string }>({
      url: `/api/payslip/${id}/pdf`,
      responseSchema: z.object({ signedUrl: z.string() }),
    });
    return result.signedUrl;
  }
}

export const payslipService = new PayslipService();
