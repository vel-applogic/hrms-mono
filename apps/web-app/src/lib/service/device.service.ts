import {
  DeviceCreateRequestType,
  DeviceDetailResponseSchema,
  DeviceDetailResponseType,
  DeviceFilterRequestType,
  DeviceResponseSchema,
  DeviceResponseType,
  DeviceUpdateRequestType,
  EmployeeDeviceResponseSchema,
  EmployeeDeviceResponseType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';
import { z } from 'zod';

import { BaseService } from './_base.service';

class DeviceService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: DeviceFilterRequestType): Promise<PaginatedResponseType<DeviceResponseType>> {
    return this.patch<PaginatedResponseType<DeviceResponseType>, DeviceFilterRequestType>({
      url: '/api/device/search',
      data: params,
      responseSchema: PaginatedResponseSchema(DeviceResponseSchema),
    });
  }

  async getById(id: number): Promise<DeviceDetailResponseType> {
    return this.get<DeviceDetailResponseType>({
      url: `/api/device/${id}`,
      responseSchema: DeviceDetailResponseSchema,
    });
  }

  async create(data: DeviceCreateRequestType): Promise<DeviceResponseType> {
    return this.post<DeviceResponseType, DeviceCreateRequestType>({
      url: '/api/device',
      data,
      responseSchema: DeviceResponseSchema,
    });
  }

  async update(id: number, data: DeviceUpdateRequestType): Promise<DeviceResponseType> {
    return this.put<DeviceResponseType, DeviceUpdateRequestType>({
      url: `/api/device/${id}`,
      data,
      responseSchema: DeviceResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/device/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async getMyDevices(): Promise<EmployeeDeviceResponseType[]> {
    return this.get<EmployeeDeviceResponseType[]>({
      url: '/api/device/my-device',
      responseSchema: z.array(EmployeeDeviceResponseSchema),
    });
  }

  async getUserDevices(userId: number): Promise<EmployeeDeviceResponseType[]> {
    return this.get<EmployeeDeviceResponseType[]>({
      url: `/api/device/user/${userId}`,
      responseSchema: z.array(EmployeeDeviceResponseSchema),
    });
  }
}

export const deviceService = new DeviceService();
