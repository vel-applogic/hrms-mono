import { SearchParamsSchema, ExpenseFilterRequestType } from '@repo/dto';

import { ExpenseData } from '@/feature/expense/expense-data';
import { expenseService } from '@/lib/service/expense.service';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ExpensePage({ searchParams }: Props) {
  const expenseSearchParams = SearchParamsSchema.parse(await searchParams);

  const filterRequest: ExpenseFilterRequestType = {
    pagination: {
      page: expenseSearchParams.page ?? 1,
      limit: expenseSearchParams.pageSize ?? 50,
    },
    search: expenseSearchParams.search,
  };

  const data = await expenseService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <ExpenseData data={data} searchParams={expenseSearchParams} />
    </div>
  );
}
