'use server';

import type {
  AnnouncementCreateRequestType,
  AnnouncementDetailResponseType,
  AnnouncementResponseType,
  AnnouncementUpdateRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { announcementService } from '@/lib/service/announcement.service';

export async function createAnnouncement(data: AnnouncementCreateRequestType): Promise<AnnouncementResponseType> {
  const result = await announcementService.create(data);
  revalidatePath('/announcement');
  return result;
}

export async function updateAnnouncement(id: number, data: AnnouncementUpdateRequestType): Promise<AnnouncementResponseType> {
  const result = await announcementService.update(id, data);
  revalidatePath('/announcement');
  return result;
}

export async function getAnnouncementById(id: number): Promise<AnnouncementDetailResponseType> {
  return announcementService.getById(id);
}

export async function deleteAnnouncement(id: number): Promise<OperationStatusResponseType> {
  const result = await announcementService.remove(id);
  revalidatePath('/announcement');
  return result;
}
