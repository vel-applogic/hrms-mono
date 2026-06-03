import { redirect } from 'next/navigation';

import { SearchParamsSchema } from '@repo/dto';
import { getFinancialYearCode } from '@repo/shared';

import { LeaveCounterData } from '@/feature/leave/leave-counter-data';
import { auth } from '@/lib/auth/auth';
import { getCurrentOrgFinancialYearStartMonth } from '@/lib/financial-year';
import { leaveService } from '@/lib/service/leave.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeavesPage(props: Props) {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/emp/dashboard');
  }
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);
  const startMonth = await getCurrentOrgFinancialYearStartMonth();
  const defaultFinancialYear = getFinancialYearCode(new Date(), startMonth);
  const financialYear = validatedParams.financialYear ?? defaultFinancialYear;

  const counters = await leaveService.getCounters(financialYear);

  return (
    <div className='flex h-full flex-col'>
      <LeaveCounterData counters={counters} financialYear={financialYear} financialYearStartMonth={startMonth} />
    </div>
  );
}
