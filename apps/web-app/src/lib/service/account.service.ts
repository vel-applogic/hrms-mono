import {
  AccountChangePasswordRequestType,
  AccountUpdateProfileRequestType,
  AccountUpdateProfileResponseSchema,
  AccountUpdateProfileResponseType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class AccountService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async getProfile(): Promise<AccountUpdateProfileResponseType> {
    return this.get<AccountUpdateProfileResponseType>({
      url: '/api/admin/account/profile',
      responseSchema: AccountUpdateProfileResponseSchema,
    });
  }

  async updateProfile(data: AccountUpdateProfileRequestType): Promise<AccountUpdateProfileResponseType> {
    return this.put<AccountUpdateProfileResponseType, AccountUpdateProfileRequestType>({
      url: '/api/admin/account/profile',
      data,
      responseSchema: AccountUpdateProfileResponseSchema,
    });
  }

  async changePassword(data: AccountChangePasswordRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, AccountChangePasswordRequestType>({
      url: '/api/admin/account/change-password',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const accountService = new AccountService();
