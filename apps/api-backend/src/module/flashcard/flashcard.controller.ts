import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  FlashcardCreateRequestType,
  FlashcardDetailResponseType,
  FlashcardFilterRequestType,
  FlashcardListResponseType,
  FlashcardUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { FlashcardCreateRequestSchema, FlashcardFilterRequestSchema, FlashcardUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { FlashcardCreateUc } from './uc/flashcard-create.uc.js';
import { FlashcardDeleteUc } from './uc/flashcard-delete.uc.js';
import { FlashcardGetUc } from './uc/flashcard-get.uc.js';
import { FlashcardSearchUc } from './uc/flashcard-search.uc.js';
import { FlashcardUpdateUc } from './uc/flashcard-update.uc.js';

@Controller('api/flashcard')
export class FlashcardController {
  constructor(
    private readonly searchUc: FlashcardSearchUc,
    private readonly getUc: FlashcardGetUc,
    private readonly createUc: FlashcardCreateUc,
    private readonly updateUc: FlashcardUpdateUc,
    private readonly deleteUc: FlashcardDeleteUc,
  ) {}

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<FlashcardDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(FlashcardCreateRequestSchema)) body: FlashcardCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(FlashcardUpdateRequestSchema)) body: FlashcardUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(FlashcardFilterRequestSchema)) filterDto: FlashcardFilterRequestType,
  ): Promise<PaginatedResponseType<FlashcardListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
