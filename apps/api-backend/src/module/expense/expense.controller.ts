import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import type {
  ExpenseCreateRequestType,
  ExpenseFilterRequestType,
  ExpenseResponseType,
  ExpenseSummaryResponseType,
  ExpenseUpdateRequestType,
  OperationStatusResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { ExpenseCreateRequestSchema, ExpenseFilterRequestSchema, ExpenseUpdateRequestSchema } from '@repo/dto';
import type { CurrentUserType } from '@repo/nest-lib';
import { AdminOnly, CurrentUser, ZodValidationPipe } from '@repo/nest-lib';

import { ExpenseCreateUc } from './uc/expense-create.uc.js';
import { ExpenseDeleteUc } from './uc/expense-delete.uc.js';
import { ExpenseGetUc } from './uc/expense-get.uc.js';
import { ExpenseListUc } from './uc/expense-list.uc.js';
import { ExpenseSummaryUc } from './uc/expense-summary.uc.js';
import { ExpenseUpdateUc } from './uc/expense-update.uc.js';

@AdminOnly()
@Controller('api/expense')
export class ExpenseController {
  constructor(
    private readonly listUc: ExpenseListUc,
    private readonly getUc: ExpenseGetUc,
    private readonly createUc: ExpenseCreateUc,
    private readonly updateUc: ExpenseUpdateUc,
    private readonly deleteUc: ExpenseDeleteUc,
    private readonly summaryUc: ExpenseSummaryUc,
  ) {}

  @Get('/summary')
  async summary(@CurrentUser() currentUser: CurrentUserType): Promise<ExpenseSummaryResponseType> {
    return this.summaryUc.execute({ currentUser });
  }

  @Patch('/search')
  async search(
    @CurrentUser() currentUser: CurrentUserType,
    @Body(new ZodValidationPipe(ExpenseFilterRequestSchema)) filterDto: ExpenseFilterRequestType,
  ): Promise<PaginatedResponseType<ExpenseResponseType>> {
    return this.listUc.execute({ currentUser, filterDto });
  }

  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ExpenseResponseType> {
    return this.getUc.execute({ currentUser, id });
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(ExpenseCreateRequestSchema)) body: ExpenseCreateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ExpenseResponseType> {
    return this.createUc.execute({ currentUser, dto: body });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(ExpenseUpdateRequestSchema)) body: ExpenseUpdateRequestType,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<ExpenseResponseType> {
    return this.updateUc.execute({ currentUser, id, dto: body });
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: CurrentUserType,
  ): Promise<OperationStatusResponseType> {
    return this.deleteUc.execute({ currentUser, id });
  }
}
