'use server';

import type {
  DeviceCreateRequestType,
  DeviceDetailResponseType,
  DeviceFilterRequestType,
  DeviceResponseType,
  DeviceUpdateRequestType,
  EmployeeDeviceResponseType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { deviceService } from '@/lib/service/device.service';

export async function searchDevices(filterRequest: DeviceFilterRequestType): Promise<PaginatedResponseType<DeviceResponseType>> {
  return deviceService.search(filterRequest);
}

export async function createDevice(data: DeviceCreateRequestType): Promise<DeviceResponseType> {
  const result = await deviceService.create(data);
  revalidatePath('/device');
  return result;
}

export async function updateDevice(id: number, data: DeviceUpdateRequestType): Promise<DeviceResponseType> {
  const result = await deviceService.update(id, data);
  revalidatePath('/device');
  return result;
}

export async function getDeviceById(id: number): Promise<DeviceDetailResponseType> {
  return deviceService.getById(id);
}

export async function deleteDevice(id: number): Promise<OperationStatusResponseType> {
  const result = await deviceService.remove(id);
  revalidatePath('/device');
  return result;
}

export async function getMyDevices(): Promise<EmployeeDeviceResponseType[]> {
  return deviceService.getMyDevices();
}

export async function getEmployeeDevices(userId: number): Promise<EmployeeDeviceResponseType[]> {
  return deviceService.getUserDevices(userId);
}
