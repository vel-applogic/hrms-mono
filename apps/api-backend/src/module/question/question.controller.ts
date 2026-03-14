import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type { OperationStatusResponseType, PaginatedResponseType, QuestionCreateRequestType, QuestionDetailResponseType, QuestionFilterRequestType, QuestionListResponseType, QuestionUpdateRequestType } from '@repo/dto';
import { QuestionCreateRequestSchema, QuestionFilterRequestSchema, QuestionUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType, } from '@repo/nest-lib';
import { CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { QuestionCreateUc } from './uc/question-create.uc.js';
import { QuestionDeleteUc } from './uc/question-delete.uc.js';
import { QuestionGetUc } from './uc/question-get.uc.js';
import { QuestionSearchUc } from './uc/question-search.uc.js';
import { QuestionUpdateUc } from './uc/question-update.uc.js';

@Controller('api/question')
export class QuestionController {
  constructor(
    private readonly searchUc: QuestionSearchUc,
    private readonly getUc: QuestionGetUc,
    private readonly createUc: QuestionCreateUc,
    private readonly updateUc: QuestionUpdateUc,
    private readonly deleteUc: QuestionDeleteUc,
  ) {}

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType ): Promise<QuestionDetailResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post()
  async create(@Body(new ZodValidationPipe(QuestionCreateRequestSchema)) body: QuestionCreateRequestType, @CurrentUser() currentUser: CurrentUserType ): Promise<OperationStatusResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body(new ZodValidationPipe(QuestionUpdateRequestSchema)) body: QuestionUpdateRequestType, @CurrentUser() currentUser: CurrentUserType ): Promise<OperationStatusResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Patch('/search')
  public async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(QuestionFilterRequestSchema)) filterDto: QuestionFilterRequestType,
  ): Promise<PaginatedResponseType<QuestionListResponseType>> {
    return await this.searchUc.execute({ currentUser, filterDto: filterDto });
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() currentUser: CurrentUserType ): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
