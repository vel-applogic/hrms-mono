'use client';

import type {
  ReimbursementFilterRequestType,
  ReimbursementResponseType,
  ReimbursementStatusDtoEnum,
  PaginatedResponseType,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { searchReimbursements } from '@/lib/action/reimbursement.actions';

import { ReimbursementCreateDrawer } from './container/reimbursement-create.drawer';
import { ReimbursementDetailDrawer } from './container/reimbursement-detail.drawer';
import { ReimbursementStatusFilter } from './container/reimbursement-status-filter';
import { ReimbursementDataTable } from './reimbursement.datatable';

interface Props {
  data: PaginatedResponseType<ReimbursementResponseType>;
  isAdmin: boolean;
}

export const ReimbursementData = ({ data: initialData, isAdmin }: Props) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState('');
  const prevSearchTextRef = useRef(searchText);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedReimbursementId, setSelectedReimbursementId] = useState<number | null>(null);
  const [data, setData] = useState(initialData);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(currentSearchParams.toString());
      const query = searchText.trim();
      const searchChanged = searchText !== prevSearchTextRef.current;
      prevSearchTextRef.current = searchText;

      if (query.length > 0) {
        params.set('search', query);
      } else {
        params.delete('search');
      }
      if (searchChanged) {
        params.set('page', '1');
      }

      const nextQueryString = params.toString();
      const currentQueryString = currentSearchParams.toString();
      if (nextQueryString === currentQueryString) return;

      replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchText, currentSearchParams, pathname, replace]);

  const handleView = useCallback((reimbursement: ReimbursementResponseType) => {
    setSelectedReimbursementId(reimbursement.id);
    setDetailDrawerOpen(true);
  }, []);

  const handleStatusChange = (values: string[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('statuses', values.join(','));
    } else {
      params.delete('statuses');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    setSearchText('');
    replace(pathname);
  };

  const statusValues = currentSearchParams.get('statuses')?.split(',').filter(Boolean) ?? [];
  const hasActiveFilters = searchText.trim().length > 0 || statusValues.length > 0;

  const handleRefresh = useCallback(async () => {
    const filterRequest: ReimbursementFilterRequestType = {
      pagination: { page: 1, limit: 50 },
      search: currentSearchParams.get('search') ?? undefined,
      statuses: statusValues.length > 0 ? (statusValues as ReimbursementStatusDtoEnum[]) : undefined,
    };
    try {
      const refreshedData = await searchReimbursements(filterRequest);
      setData(refreshedData);
    } catch {
      refresh();
    }
  }, [currentSearchParams, statusValues, refresh]);

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='flex items-end justify-between gap-3'>
        <div className='flex flex-wrap items-end gap-3'>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Status</span>
            <ReimbursementStatusFilter values={statusValues} onChange={handleStatusChange} />
          </div>
          <div className='flex flex-col gap-1'>
            <span className='text-xs text-muted-foreground'>Search</span>
            <div className='flex h-10 w-[298px] shrink-0 items-center gap-3 rounded-[40px] border border-input bg-white px-4'>
              <svg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M7.33 12.67A5.33 5.33 0 1 0 7.33 2a5.33 5.33 0 0 0 0 10.67ZM14 14l-2.9-2.9'
                  stroke='#848A91'
                  strokeWidth='1.33'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <input
                type='text'
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder='Search by title...'
                className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
              />
            </div>
          </div>
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={handleClearAll} className='shrink-0'>
              <X className='h-4 w-4' />
              Clear
            </Button>
          )}
        </div>
        <Button className='shrink-0 rounded-[40px]' onClick={() => setCreateDrawerOpen(true)}>
          <Plus className='h-4 w-4' />
          New request
        </Button>
      </div>

      <div className='flex flex-1 flex-col min-h-0'>
        <ReimbursementDataTable
          data={data}
          isAdmin={isAdmin}
          onView={handleView}
          onRefresh={handleRefresh}
        />
      </div>

      <ReimbursementCreateDrawer
        open={createDrawerOpen}
        onOpenChange={setCreateDrawerOpen}
        onSuccess={handleRefresh}
      />

      <ReimbursementDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        reimbursementId={selectedReimbursementId}
        isAdmin={isAdmin}
        onStatusChange={handleRefresh}
      />
    </div>
  );
};
