import { redirect } from 'next/navigation';

import { LeaveStatusDtoEnum } from '@repo/dto';

import { LeaveApprovalData } from '@/feature/leave/leave-approval-data';
import { searchLeaves } from '@/lib/action/leave.actions';
import { auth } from '@/lib/auth/auth';

export default async function LeaveApprovalsPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/emp/dashboard');
  }
  const initialData = await searchLeaves({
    pagination: { page: 1, limit: 50 },
    status: [LeaveStatusDtoEnum.pending],
  });

  return (
    <div className='flex h-full flex-col'>
      <LeaveApprovalData initialData={initialData} />
    </div>
  );
}
