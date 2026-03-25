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
    return this.patch<PaginatedResponseType<AdminUserListResponseType>, UserFilterRequestType>({
      url: '/api/admin-user/search',
      data: params,
      responseSchema: PaginatedResponseSchema(AdminUserListResponseSchema),
    });
  }

  async getStats(): Promise<AdminUserStatsResponseType> {
    return this.get<AdminUserStatsResponseType>({
      url: '/api/admin-user/stats',
      responseSchema: AdminUserStatsResponseSchema,
    });
  }

  async getById(id: number): Promise<AdminUserDetailResponseType> {
    return this.get<AdminUserDetailResponseType>({
      url: `/api/admin-user/${id}`,
      responseSchema: AdminUserDetailResponseSchema,
    });
  }

  async create(data: AdminUserCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, AdminUserCreateRequestType>({
      url: '/api/admin-user',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: AdminUserUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, AdminUserUpdateRequestType>({
      url: `/api/admin-user/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/admin-user/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const userService = new UserService();
