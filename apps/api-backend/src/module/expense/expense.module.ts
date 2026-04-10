import { Module } from '@nestjs/common';

import { ExpenseController } from './expense.controller.js';
import { ExpenseCreateUc } from './uc/expense-create.uc.js';
import { ExpenseDeleteUc } from './uc/expense-delete.uc.js';
import { ExpenseGetUc } from './uc/expense-get.uc.js';
import { ExpenseListUc } from './uc/expense-list.uc.js';
import { ExpenseSummaryUc } from './uc/expense-summary.uc.js';
import { ExpenseUpdateUc } from './uc/expense-update.uc.js';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseListUc, ExpenseGetUc, ExpenseCreateUc, ExpenseUpdateUc, ExpenseDeleteUc, ExpenseSummaryUc],
})
export class ExpenseModule {}
