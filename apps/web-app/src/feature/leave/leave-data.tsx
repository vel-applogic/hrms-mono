'use client';

import type { LeaveFilterRequestType, LeaveResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/shadcn/select';
import { Button } from '@repo/ui/component/ui/button';
import { CalendarPlus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import { LeaveStatusFilter } from '@/app/lib/container/leave-status-filter';

import { LeaveApplyDrawer } from './container/leave-apply.drawer';
import { LeaveDataTableClient } from './leave.datatable';

type SelectOption = { value: string; label: string };

interface Props {
  data: PaginatedResponseType<LeaveResponseType>;
  employees: { id: number; label: string; value: string }[];
  defaultFinancialYear: string;
  financialYearOptions: SelectOption[];
  searchParams: SearchParamsType;
}

export const LeaveData = ({ data, employees, defaultFinancialYear, financialYearOptions, searchParams }: Props) => {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isAdmin = session?.user?.roles?.includes('admin') ?? false;
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveResponseType | null>(null);

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

  const handleApplyLeave = () => {
    setEditingLeave(null);
    setDrawerOpen(true);
  };

  const handleEdit = (leave: LeaveResponseType) => {
    setEditingLeave(leave);
    setDrawerOpen(true);
  };

  const handleStatusChange = (values: string[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('leaveStatus', values.join(','));
    } else {
      params.delete('leaveStatus');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleFinancialYearChange = (value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set('financialYear', value);
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleEmployeeChange = (values: string[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('userId', values.join(','));
    } else {
      params.delete('userId');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    setSearchText('');
    const params = new URLSearchParams();
    params.set('financialYear', defaultFinancialYear);
    replace(`${pathname}?${params.toString()}`);
  };

  const currentFinancialYear = searchParams.financialYear ?? defaultFinancialYear;
  const employeeValues = searchParams.userId?.map(String) ?? [];

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    (searchParams.search?.trim().length ?? 0) > 0 ||
    (searchParams.leaveStatus?.length ?? 0) > 0 ||
    (searchParams.userId?.length ?? 0) > 0 ||
    currentFinancialYear !== defaultFinancialYear;

  const employeeSelectOptions = employees.map((e) => ({ value: e.value, label: e.label }));

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-foreground'>Leave Details for {currentFinancialYear}</span>
        <Button className='shrink-0 rounded-[40px]' onClick={handleApplyLeave}>
          <CalendarPlus className='h-4 w-4' />
          Apply leave
        </Button>
      </div>

      <div className='flex items-center justify-between gap-3'>
        <span className='text-sm font-medium text-muted-foreground'>
          {data.totalRecords > 0
            ? `Showing records: ${(data.page - 1) * data.limit + 1} - ${Math.min(data.page * data.limit, data.totalRecords)} of ${data.totalRecords}`
            : 'No records found'}
        </span>
        <div className='flex items-center gap-3'>
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={handleClearAll} className='shrink-0'>
              <X className='h-4 w-4' />
              Clear
            </Button>
          )}
          <Select value={currentFinancialYear} onValueChange={handleFinancialYearChange}>
            <SelectTrigger className='h-10 w-[140px]'>
              <SelectValue placeholder='Financial Year' />
            </SelectTrigger>
            <SelectContent>
              {financialYearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <LeaveStatusFilter values={searchParams.leaveStatus} onChange={handleStatusChange} />
          <SelectSearchMulti
            values={employeeValues}
            options={employeeSelectOptions}
            placeholder='Employee'
            searchPlaceholder='Search employee...'
            onChange={handleEmployeeChange}
            className='w-[180px]'
          />
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
              placeholder='Search by name or email...'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
        </div>
      </div>

      <div className='flex flex-1 flex-col min-h-0 pb-4'>
        <LeaveDataTableClient
          data={data}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onEdit={handleEdit}
          onView={(leave) => replace(`${pathname}?userId=${leave.userId}&financialYear=${currentFinancialYear}`)}
          onRefresh={() => refresh()}
        />
      </div>

      <LeaveApplyDrawer open={drawerOpen} onOpenChange={setDrawerOpen} leave={editingLeave} onSuccess={() => refresh()} />
    </div>
  );
};
