import {
  AdminUserCreateRequestType,
  AdminUserDetailResponseSchema,
  AdminUserDetailResponseType,
  AdminUserListResponseSchema,
  AdminUserListResponseType,
  AdminUserStatsResponseSchema,
  AdminUserStatsResponseType,
  AdminUserUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
  UserFilterRequestType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class UserService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: UserFilterRequestType): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    const data = await this.patch<PaginatedResponseType<AdminUserListResponseType>, UserFilterRequestType>({
      url: '/api/admin/user/search',
      data: params,
      responseSchema: PaginatedResponseSchema(AdminUserListResponseSchema),
    });
    return data;
  }

  async searchPublicUsers(params: UserFilterRequestType): Promise<PaginatedResponseType<AdminUserListResponseType>> {
    const data = await this.patch<PaginatedResponseType<AdminUserListResponseType>, UserFilterRequestType>({
      url: '/api/admin/user/search-public-user',
      data: params,
      responseSchema: PaginatedResponseSchema(AdminUserListResponseSchema),
    });
    return data;
  }

  async getStats(): Promise<AdminUserStatsResponseType> {
    return this.get<AdminUserStatsResponseType>({
      url: '/api/admin/user/get-public-user-stats',
      responseSchema: AdminUserStatsResponseSchema,
    });
  }

  // async getFilterOptions(): Promise<FilterOptionsResponseType> {
  //   return this.get<FilterOptionsResponseType>({
  //     url: '/api/user/search/filter',
  //     responseSchema: FilterOptionsResponseSchema,
  //   });
  // }

  async getById(id: number): Promise<AdminUserDetailResponseType> {
    return this.get<AdminUserDetailResponseType>({ url: `/api/admin/user/${id}`, responseSchema: AdminUserDetailResponseSchema });
  }

  async create(data: AdminUserCreateRequestType): Promise<AdminUserDetailResponseType> {
    return this.post<AdminUserDetailResponseType, AdminUserCreateRequestType>({ url: '/api/admin/user', data, responseSchema: AdminUserDetailResponseSchema });
  }

  async update(data: AdminUserUpdateRequestType): Promise<AdminUserDetailResponseType> {
    return this.put<AdminUserDetailResponseType, AdminUserUpdateRequestType>({ url: '/api/admin/user', data, responseSchema: AdminUserDetailResponseSchema });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({ url: `/api/admin/user/${id}`, responseSchema: OperationStatusResponseSchema });
  }

  async block(id: number): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, undefined>({ url: `/api/admin/user/block/${id}`, data: undefined, responseSchema: OperationStatusResponseSchema });
  }

  async unblock(id: number): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, undefined>({ url: `/api/admin/user/unblock/${id}`, data: undefined, responseSchema: OperationStatusResponseSchema });
  }

  async upgradePlan(id: number): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, undefined>({ url: `/api/admin/user/upgrade-plan/${id}`, data: undefined, responseSchema: OperationStatusResponseSchema });
  }

  async downgradePlan(id: number): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, undefined>({ url: `/api/admin/user/downgrade-plan/${id}`, data: undefined, responseSchema: OperationStatusResponseSchema });
  }
}

export const userService = new UserService();
