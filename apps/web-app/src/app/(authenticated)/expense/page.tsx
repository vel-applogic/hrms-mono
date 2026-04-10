import { SearchParamsSchema, ExpenseFilterRequestType } from '@repo/dto';
import { getFinancialYearCode, getLastFinancialYearCodes } from '@repo/shared';

import { ExpenseData } from '@/feature/expense/expense-data';
import { expenseService } from '@/lib/service/expense.service';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExpensePage({ searchParams }: Props) {
  const expenseSearchParams = SearchParamsSchema.parse(await searchParams);
  const currentFinancialYear = expenseSearchParams.financialYear ?? getFinancialYearCode(new Date());
  const financialYearOptions = getLastFinancialYearCodes(3).map((code) => ({ value: code, label: code }));

  const filterRequest: ExpenseFilterRequestType = {
    pagination: {
      page: expenseSearchParams.page ?? 1,
      limit: expenseSearchParams.pageSize ?? 50,
    },
    search: expenseSearchParams.search,
    financialYear: currentFinancialYear,
  };

  if (expenseSearchParams.months && expenseSearchParams.months.length > 0) {
    filterRequest.months = expenseSearchParams.months;
  }

  const data = await expenseService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <ExpenseData
        data={data}
        searchParams={expenseSearchParams}
        currentFinancialYear={currentFinancialYear}
        financialYearOptions={financialYearOptions}
      />
    </div>
  );
}
