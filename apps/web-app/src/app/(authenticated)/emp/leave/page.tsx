import { redirect } from 'next/navigation';
import { getFinancialYearCode } from '@repo/shared';

import { EmpLeaveData } from '@/feature/emp/emp-leave-data';
import { auth } from '@/lib/auth/auth';
import { searchLeaves } from '@/lib/action/leave.actions';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmpLeavePage(props: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);
  const params = await props.searchParams;
  const defaultFinancialYear = getFinancialYearCode(new Date());
  const financialYear = (typeof params.financialYear === 'string' ? params.financialYear : null) ?? defaultFinancialYear;

  const initialData = await searchLeaves({
    pagination: { page: 1, limit: 50 },
    userId: [employeeId],
    financialYear,
  }).catch(() => ({ results: [], totalRecords: 0, page: 1, limit: 50 }));

  return (
    <div className='flex h-full flex-col'>
      <EmpLeaveData employeeId={employeeId} initialData={initialData} initialFinancialYear={financialYear} />
    </div>
  );
}
