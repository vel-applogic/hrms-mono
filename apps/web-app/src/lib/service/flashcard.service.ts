import {
  FlashcardCreateRequestType,
  FlashcardDetailResponseSchema,
  FlashcardDetailResponseType,
  FlashcardFilterRequestType,
  FlashcardListResponseSchema,
  FlashcardListResponseType,
  FlashcardUpdateRequestType,
  OperationStatusResponseSchema,
  OperationStatusResponseType,
  PaginatedResponseSchema,
  PaginatedResponseType,
} from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class FlashcardService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async search(params: FlashcardFilterRequestType): Promise<PaginatedResponseType<FlashcardListResponseType>> {
    return this.patch<PaginatedResponseType<FlashcardListResponseType>, FlashcardFilterRequestType>({
      url: '/api/flashcard/search',
      data: params,
      responseSchema: PaginatedResponseSchema(FlashcardListResponseSchema),
    });
  }

  async getById(id: number): Promise<FlashcardDetailResponseType> {
    return this.get<FlashcardDetailResponseType>({
      url: `/api/flashcard/${id}`,
      responseSchema: FlashcardDetailResponseSchema,
    });
  }

  async create(data: FlashcardCreateRequestType): Promise<OperationStatusResponseType> {
    return this.post<OperationStatusResponseType, FlashcardCreateRequestType>({
      url: '/api/flashcard',
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async update(id: number, data: FlashcardUpdateRequestType): Promise<OperationStatusResponseType> {
    return this.put<OperationStatusResponseType, FlashcardUpdateRequestType>({
      url: `/api/flashcard/${id}`,
      data,
      responseSchema: OperationStatusResponseSchema,
    });
  }

  async remove(id: number): Promise<OperationStatusResponseType> {
    return this.delete<OperationStatusResponseType>({
      url: `/api/flashcard/${id}`,
      responseSchema: OperationStatusResponseSchema,
    });
  }
}

export const flashcardService = new FlashcardService();
