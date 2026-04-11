'use server';

import type {
  CountResponseType,
  NotificationFilterRequestType,
  NotificationResponseType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';

import { notificationService } from '@/lib/service/notification.service';

export async function searchNotifications(filter: NotificationFilterRequestType): Promise<PaginatedResponseType<NotificationResponseType>> {
  return notificationService.search(filter);
}

export async function getNotificationUnseenCount(): Promise<CountResponseType> {
  return notificationService.unseenCount();
}

export async function markNotificationSeen(id: number): Promise<OperationStatusResponseType> {
  return notificationService.markSeen(id);
}

export async function markAllNotificationsSeen(): Promise<OperationStatusResponseType> {
  return notificationService.markAllSeen();
}
