'use server';

import type {
  HolidayCreateRequestType,
  HolidayFilterRequestType,
  HolidayResponseType,
  HolidayUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { holidayService } from '@/lib/service/holiday.service';

export async function getHolidayYears(): Promise<number[]> {
  return holidayService.getYears();
}

export async function searchHolidays(filter: HolidayFilterRequestType): Promise<PaginatedResponseType<HolidayResponseType>> {
  return holidayService.search(filter);
}

export async function createHoliday(data: HolidayCreateRequestType): Promise<HolidayResponseType> {
  const result = await holidayService.create(data);
  revalidatePath('/leaves', 'layout');
  return result;
}

export async function updateHoliday(id: number, data: HolidayUpdateRequestType): Promise<HolidayResponseType> {
  const result = await holidayService.update(id, data);
  revalidatePath('/leaves', 'layout');
  return result;
}

export async function deleteHoliday(id: number): Promise<OperationStatusResponseType> {
  const result = await holidayService.remove(id);
  revalidatePath('/leaves', 'layout');
  return result;
}
