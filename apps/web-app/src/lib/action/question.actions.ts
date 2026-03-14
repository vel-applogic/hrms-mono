'use server';

import { OperationStatusResponseType, QuestionCreateRequestType, QuestionDetailResponseType, QuestionUpdateRequestType } from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { questionService } from '@/lib/service/question.service';

export async function createQuestion(data: QuestionCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await questionService.create(data);
  revalidatePath('/question');
  return result;
}

export async function updateQuestion(id: number, data: QuestionUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await questionService.update(id, data);
  revalidatePath('/question');
  return result;
}

export async function getQuestionById(id: number): Promise<QuestionDetailResponseType> {
  return questionService.getById(id);
}

export async function deleteQuestion(id: number): Promise<OperationStatusResponseType> {
  const result = await questionService.remove(id);
  revalidatePath('/question');
  return result;
}
