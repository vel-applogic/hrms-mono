'use client';

import type { LeaveFilterRequestType, LeaveResponseType, PaginatedResponseType } from '@repo/dto';
import { getLastFinancialYearCodes } from '@repo/shared';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/shadcn/select';
import { Button } from '@repo/ui/component/ui/button';
import { CalendarPlus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { LeaveStatusFilter } from '@/app/lib/container/leave-status-filter';
import { LeaveApplyDrawer } from '@/feature/leave/container/leave-apply.drawer';
import { LeaveDataTableClient } from '@/feature/leave/leave.datatable';
import { searchLeaves } from '@/lib/action/leave.actions';

const FY_OPTIONS = getLastFinancialYearCodes(3);

interface Props {
  employeeId: number;
  initialData: PaginatedResponseType<LeaveResponseType>;
  initialFinancialYear: string;
}

export function EmployeeViewLeave({ employeeId, initialData, initialFinancialYear }: Props) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isAdmin = session?.user?.roles?.includes('admin') ?? false;

  const [financialYear, setFinancialYear] = useState(initialFinancialYear);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveResponseType | null>(null);

  const fetchData = async (fy: string, statuses: string[], p: number) => {
    setLoading(true);
    try {
      const filter: LeaveFilterRequestType = {
        pagination: { page: p, limit: 50 },
        userId: [employeeId],
        financialYear: fy,
        status: statuses.length > 0 ? (statuses as LeaveFilterRequestType['status']) : undefined,
      };
      const result = await searchLeaves(filter);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(financialYear, statusFilter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialYear, statusFilter, page]);

  const handleStatusChange = (values: string[]) => {
    setStatusFilter(values);
    setPage(1);
  };

  const handleFyChange = (value: string) => {
    setFinancialYear(value);
    setPage(1);
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-lg font-medium'>Leaves</h2>
        <div className='flex items-center gap-3'>
          <LeaveStatusFilter values={statusFilter} onChange={handleStatusChange} />
          <Select value={financialYear} onValueChange={handleFyChange}>
            <SelectTrigger className='h-10 w-[140px]'>
              <SelectValue placeholder='Financial Year' />
            </SelectTrigger>
            <SelectContent>
              {FY_OPTIONS.map((fy) => (
                <SelectItem key={fy} value={fy}>
                  {fy}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size='sm'
            onClick={() => {
              setEditingLeave(null);
              setDrawerOpen(true);
            }}
          >
            <CalendarPlus className='h-4 w-4' />
            Apply leave
          </Button>
        </div>
      </div>

      {loading ? (
        <p className='py-4 text-sm text-muted-foreground'>Loading...</p>
      ) : data.results.length > 0 ? (
        <div className='flex min-h-0 flex-1 flex-col'>
          <div className='min-h-[200px] flex-1'>
            <LeaveDataTableClient
              data={data}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              autoHeight
              onEdit={(leave) => {
                setEditingLeave(leave);
                setDrawerOpen(true);
              }}
              onRefresh={() => fetchData(financialYear, statusFilter, page)}
            />
          </div>
        </div>
      ) : (
        <p className='py-4 text-sm text-muted-foreground'>No leave records found.</p>
      )}

      <LeaveApplyDrawer open={drawerOpen} onOpenChange={setDrawerOpen} leave={editingLeave} employeeId={employeeId} onSuccess={() => fetchData(financialYear, statusFilter, page)} />
    </div>
  );
}
