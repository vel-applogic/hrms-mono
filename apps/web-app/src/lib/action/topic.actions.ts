'use server';

import { OperationStatusResponseType, TopicCreateRequestType, TopicDetailResponseType, TopicListResponseType, TopicUpdateRequestType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { topicService } from '@/lib/service/topic.service';

export async function createTopic(data: TopicCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await topicService.create(data);
  revalidatePath('/chapter');
  revalidatePath('/topic');
  return result;
}

export async function updateTopic(id: number, data: TopicUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await topicService.update(id, data);
  revalidatePath('/chapter');
  revalidatePath('/topic');
  return result;
}

export async function getTopicById(id: number): Promise<TopicDetailResponseType> {
  return topicService.getById(id);
}

export async function deleteTopic(id: number): Promise<OperationStatusResponseType> {
  const result = await topicService.remove(id);
  revalidatePath('/chapter');
  revalidatePath('/topic');
  return result;
}

export async function getTopicsList(chapterId?: number): Promise<TopicListResponseType[]> {
  const result = await topicService.search({ pagination: { page: 1, limit: 500 }, chapterId });
  return result.results;
}
