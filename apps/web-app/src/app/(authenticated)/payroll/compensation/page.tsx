import { SearchParamsSchema } from '@repo/dto';

import { PayrollCompensationData } from '@/feature/payroll/payroll-compensation-data';
import { searchPayrollActiveCompensations } from '@/lib/action/employee-compensation.actions';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PayrollCompensationPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const data = await searchPayrollActiveCompensations({
    pagination: {
      page: validatedParams.page ?? 1,
      limit: validatedParams.pageSize ?? 50,
    },
    search: validatedParams.search,
  });

  return (
    <div className='flex h-full flex-col'>
      <PayrollCompensationData data={data} searchParams={validatedParams} />
    </div>
  );
}
