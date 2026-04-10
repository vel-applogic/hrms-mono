import { redirect } from 'next/navigation';
import type { ReimbursementFilterRequestType, ReimbursementStatusDtoEnum } from '@repo/dto';

import { ReimbursementData } from '@/feature/reimbursement/reimbursement-data';
import { auth } from '@/lib/auth/auth';
import { searchReimbursements } from '@/lib/action/reimbursement.actions';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmpReimbursementPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const params = await searchParams;
  const statusParam = typeof params.statuses === 'string' ? params.statuses : undefined;
  const searchParam = typeof params.search === 'string' ? params.search : undefined;

  const filterRequest: ReimbursementFilterRequestType = {
    pagination: { page: 1, limit: 50 },
    search: searchParam,
    statuses: statusParam ? (statusParam.split(',').filter(Boolean) as ReimbursementStatusDtoEnum[]) : undefined,
  };

  const data = await searchReimbursements(filterRequest).catch(() => ({
    results: [],
    totalRecords: 0,
    page: 1,
    limit: 50,
  }));

  return (
    <div className='flex h-full flex-col'>
      <ReimbursementData data={data} isAdmin={false} />
    </div>
  );
}
