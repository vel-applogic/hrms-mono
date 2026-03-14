'use server';

import { OperationStatusResponseType, ThemeCreateRequestType, ThemeDetailResponseType, ThemeListResponseType, ThemeUpdateRequestType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { themeService } from '@/lib/service/theme.service';

export async function createTheme(data: ThemeCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await themeService.create(data);
  revalidatePath('/theme');
  return result;
}

export async function updateTheme(id: number, data: ThemeUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await themeService.update(id, data);
  revalidatePath('/theme');
  return result;
}

export async function getThemeById(id: number): Promise<ThemeDetailResponseType> {
  return themeService.getById(id);
}

export async function deleteTheme(id: number): Promise<OperationStatusResponseType> {
  const result = await themeService.remove(id);
  revalidatePath('/theme');
  return result;
}

export async function getThemesList(): Promise<ThemeListResponseType[]> {
  const result = await themeService.search({ pagination: { page: 1, limit: 500 } });
  return result.results;
}
