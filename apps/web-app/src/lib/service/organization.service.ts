import {
  OrganizationCreateRequestType,
  OrganizationDetailResponseSchema,
  OrganizationDetailResponseType,
  OrganizationFilterRequestType,
  OrganizationResponseSchema,
  OrganizationResponseType,
  OrganizationUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class OrganizationService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: OrganizationFilterRequestType): Promise<PaginatedResponseType<OrganizationResponseType>> {
    return this.patch<PaginatedResponseType<OrganizationResponseType>, OrganizationFilterRequestType>({
      url: '/api/organization/search',
      data: params,
      responseSchema: PaginatedResponseSchema(OrganizationResponseSchema),
    });
  }

  async getById(id: number): Promise<OrganizationDetailResponseType> {
    return this.get<OrganizationDetailResponseType>({
      url: `/api/organization/${id}`,
      responseSchema: OrganizationDetailResponseSchema,
    });
  }

  async create(data: OrganizationCreateRequestType): Promise<OrganizationResponseType> {
    return this.post<OrganizationResponseType, OrganizationCreateRequestType>({
      url: '/api/organization',
      data,
      responseSchema: OrganizationResponseSchema,
    });
  }

  async update(id: number, data: OrganizationUpdateRequestType): Promise<OrganizationResponseType> {
    return this.put<OrganizationResponseType, OrganizationUpdateRequestType>({
      url: `/api/organization/${id}`,
      data,
      responseSchema: OrganizationResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/organization/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const organizationService = new OrganizationService();
