'use server';

import {
  FlashcardCreateRequestType,
  FlashcardDetailResponseType,
  FlashcardUpdateRequestType,
  OperationStatusResponseType,
} from '@repo/dto';
import { revalidatePath } from 'next/cache';

import { flashcardService } from '@/lib/service/flashcard.service';

export async function createFlashcard(data: FlashcardCreateRequestType): Promise<OperationStatusResponseType> {
  const result = await flashcardService.create(data);
  revalidatePath('/flashcard');
  return result;
}

export async function updateFlashcard(id: number, data: FlashcardUpdateRequestType): Promise<OperationStatusResponseType> {
  const result = await flashcardService.update(id, data);
  revalidatePath('/flashcard');
  return result;
}

export async function getFlashcardById(id: number): Promise<FlashcardDetailResponseType> {
  return flashcardService.getById(id);
}

export async function deleteFlashcard(id: number): Promise<OperationStatusResponseType> {
  const result = await flashcardService.remove(id);
  revalidatePath('/flashcard');
  return result;
}
