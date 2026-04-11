import type {
  CountResponseType,
  NotificationFilterRequestType,
  NotificationResponseType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import {
  CountResponseSchema,
  NotificationResponseSchema,
  OperationStatusResponseSchema,
  PaginatedResponseSchema,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class NotificationService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: NotificationFilterRequestType): Promise<PaginatedResponseType<NotificationResponseType>> {
    return this.patch<PaginatedResponseType<NotificationResponseType>, NotificationFilterRequestType>({
      url: '/api/notification/search',
      data: params,
      responseSchema: PaginatedResponseSchema(NotificationResponseSchema),
    });
  }

  async unseenCount(): Promise<CountResponseType> {
    return this.get<CountResponseType>({
      url: '/api/notification/unseen-count',
      responseSchema: CountResponseSchema,
    });
  }

  async markSeen(id: number): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, Record<string, never>>({
      url: `/api/notification/${id}/mark-seen`,
      data: {},
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async markAllSeen(): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, Record<string, never>>({
      url: '/api/notification/mark-all-seen',
      data: {},
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const notificationService = new NotificationService();
