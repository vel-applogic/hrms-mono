'use server';

import { ChapterCreateRequestType, ChapterDetailResponseType, ChapterListResponseType, ChapterUpdateRequestType, OperationStatusResponseType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { chapterService } from '@/lib/service/chapter.service';

export async function createChapter(data: ChapterCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await chapterService.create(data);
  revalidatePath('/chapter');
  return result;
}

export async function updateChapter(id: number, data: ChapterUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await chapterService.update(id, data);
  revalidatePath('/chapter');
  return result;
}

export async function getChapterById(id: number): Promise<ChapterDetailResponseType> {
  return chapterService.getById(id);
}

export async function deleteChapter(id: number): Promise<OperationStatusResponseType> {
  const result = await chapterService.remove(id);
  revalidatePath('/chapter');
  return result;
}

export async function getChaptersList(): Promise<ChapterListResponseType[]> {
  const result = await chapterService.search({ pagination: { page: 1, limit: 500 } });
  return result.results;
}
