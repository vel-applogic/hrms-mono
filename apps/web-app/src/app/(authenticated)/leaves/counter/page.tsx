import { SearchParamsSchema } from '@repo/dto';
import { getFinancialYearCode, getLastFinancialYearCodes } from '@repo/shared';

import { LeaveCounterData } from '@/feature/leave/leave-counter-data';
import { leaveService } from '@/lib/service/leave.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeaveCounterPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);
  const defaultFinancialYear = getFinancialYearCode(new Date());
  const financialYear = validatedParams.financialYear ?? defaultFinancialYear;

  const counters = await leaveService.getCounters(financialYear);

  return (
    <div className='flex h-full flex-col'>
      <LeaveCounterData
        counters={counters}
        financialYear={financialYear}
        financialYearOptions={getLastFinancialYearCodes(3).map((code) => ({ value: code, label: code }))}
      />
    </div>
  );
}
