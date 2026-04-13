import {
  AnnouncementCreateRequestType,
  AnnouncementDetailResponseSchema,
  AnnouncementDetailResponseType,
  AnnouncementFilterRequestType,
  AnnouncementResponseSchema,
  AnnouncementResponseType,
  AnnouncementUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class AnnouncementService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: AnnouncementFilterRequestType): Promise<PaginatedResponseType<AnnouncementResponseType>> {
    return this.patch<PaginatedResponseType<AnnouncementResponseType>, AnnouncementFilterRequestType>({
      url: '/api/announcement/search',
      data: params,
      responseSchema: PaginatedResponseSchema(AnnouncementResponseSchema),
    });
  }

  async getById(id: number): Promise<AnnouncementDetailResponseType> {
    return this.get<AnnouncementDetailResponseType>({
      url: `/api/announcement/${id}`,
      responseSchema: AnnouncementDetailResponseSchema,
    });
  }

  async create(data: AnnouncementCreateRequestType): Promise<AnnouncementResponseType> {
    return this.post<AnnouncementResponseType, AnnouncementCreateRequestType>({
      url: '/api/announcement',
      data,
      responseSchema: AnnouncementResponseSchema,
    });
  }

  async update(id: number, data: AnnouncementUpdateRequestType): Promise<AnnouncementResponseType> {
    return this.put<AnnouncementResponseType, AnnouncementUpdateRequestType>({
      url: `/api/announcement/${id}`,
      data,
      responseSchema: AnnouncementResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/announcement/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const announcementService = new AnnouncementService();
