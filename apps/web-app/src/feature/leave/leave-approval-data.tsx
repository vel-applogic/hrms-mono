'use client';

import type { LeaveResponseType, PaginatedResponseType } from '@repo/dto';
import { LeaveStatusDtoEnum } from '@repo/dto';
import { useSession } from 'next-auth/react';
import { useCallback, useState } from 'react';

import { searchLeaves } from '@/lib/action/leave.actions';

import { LeaveApplyDrawer } from './container/leave-apply.drawer';
import { LeaveDataTableClient } from './leave.datatable';

interface Props {
  initialData: PaginatedResponseType<LeaveResponseType>;
}

export function LeaveApprovalData({ initialData }: Props) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(1);
  const [editingLeave, setEditingLeave] = useState<LeaveResponseType | null>(null);

  const fetchData = useCallback(async (p: number) => {
    const result = await searchLeaves({
      pagination: { page: p, limit: 50 },
      status: [LeaveStatusDtoEnum.pending],
    });
    setData(result);
    setPage(p);
  }, []);

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm text-muted-foreground'>
          {data.totalRecords} pending approval{data.totalRecords !== 1 ? 's' : ''}
        </span>
      </div>

      {data.results.length > 0 ? (
        <div className='min-h-0 flex-1'>
          <LeaveDataTableClient
            data={data}
            currentUserId={currentUserId}
            isAdmin
            onEdit={(leave) => setEditingLeave(leave)}
            onRefresh={() => fetchData(page)}
          />
        </div>
      ) : (
        <p className='py-4 text-sm text-muted-foreground'>No pending leave approvals.</p>
      )}

      <LeaveApplyDrawer
        open={!!editingLeave}
        onOpenChange={(open) => !open && setEditingLeave(null)}
        leave={editingLeave}
        onSuccess={() => fetchData(page)}
      />
    </div>
  );
}
