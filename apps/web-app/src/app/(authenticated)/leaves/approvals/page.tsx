import { LeaveStatusDtoEnum } from '@repo/dto';

import { LeaveApprovalData } from '@/feature/leave/leave-approval-data';
import { searchLeaves } from '@/lib/action/leave.actions';

export default async function LeaveApprovalsPage() {
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
