import {
  CountryResponseSchema,
  CountryResponseType,
  CurrencyResponseSchema,
  CurrencyResponseType,
  OrganisationCreateRequestType,
  OrganisationDetailResponseSchema,
  OrganisationDetailResponseType,
  OrganisationFilterRequestType,
  OrganisationResponseSchema,
  OrganisationResponseType,
  OrganisationUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class OrganisationService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async listCurrencies(): Promise<CurrencyResponseType[]> {
    return this.get<CurrencyResponseType[]>({
      url: '/api/organisation/currency',
      responseSchema: CurrencyResponseSchema.array(),
    });
  }

  async listCountries(): Promise<CountryResponseType[]> {
    return this.get<CountryResponseType[]>({
      url: '/api/organisation/country',
      responseSchema: CountryResponseSchema.array(),
    });
  }

  async search(params: OrganisationFilterRequestType): Promise<PaginatedResponseType<OrganisationResponseType>> {
    return this.patch<PaginatedResponseType<OrganisationResponseType>, OrganisationFilterRequestType>({
      url: '/api/organisation/search',
      data: params,
      responseSchema: PaginatedResponseSchema(OrganisationResponseSchema),
    });
  }

  async getById(id: number): Promise<OrganisationDetailResponseType> {
    return this.get<OrganisationDetailResponseType>({
      url: `/api/organisation/${id}`,
      responseSchema: OrganisationDetailResponseSchema,
    });
  }

  async create(data: OrganisationCreateRequestType): Promise<OrganisationResponseType> {
    return this.post<OrganisationResponseType, OrganisationCreateRequestType>({
      url: '/api/organisation',
      data,
      responseSchema: OrganisationResponseSchema,
    });
  }

  async update(id: number, data: OrganisationUpdateRequestType): Promise<OrganisationResponseType> {
    return this.put<OrganisationResponseType, OrganisationUpdateRequestType>({
      url: `/api/organisation/${id}`,
      data,
      responseSchema: OrganisationResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/organisation/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const organisationService = new OrganisationService();
