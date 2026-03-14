'use server';

import { OperationStatusResponseType, SlideCreateRequestType, SlideDetailResponseType, SlideUpdateRequestType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { slideService } from '@/lib/service/slide.service';

export async function createSlide(data: SlideCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await slideService.create(data);
  revalidatePath(`/chapter/${data.chapterId}/topic/${data.topicId}`);
  revalidatePath('/slide');
  return result;
}

export async function updateSlide(id: number, data: SlideUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await slideService.update(id, data);
  revalidatePath(`/chapter/${data.chapterId}/topic/${data.topicId}`);
  revalidatePath('/slide');
  return result;
}

export async function getSlideById(id: number): Promise<SlideDetailResponseType> {
  return slideService.getById(id);
}

export async function deleteSlide(id: number, chapterId: number, topicId: number): Promise<OperationStatusResponseType> {
  const result = await slideService.remove(id);
  revalidatePath(`/chapter/${chapterId}/topic/${topicId}`);
  revalidatePath('/slide');
  return result;
}
