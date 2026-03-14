'use client';

import { AdminUserListResponseType, AdminUserStatsResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { ActionOption } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { SelectOption, SelectSearchSingle } from '@repo/ui/component/select-search';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { UserDataTableClient } from './user.datatable';
// import { UserFilterControl } from './user-filter-control';

interface Props {
  data: PaginatedResponseType<AdminUserListResponseType>;
  searchParams: SearchParamsType;
  stats: AdminUserStatsResponseType;
  additionalActions?: ActionOption[];
  onAdditionalActionClick?: (action: string, data: AdminUserListResponseType) => void;
}

export const UserData = ({ data, searchParams, stats, additionalActions, onAdditionalActionClick }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);

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
      if (nextQueryString === currentQueryString) {
        return;
      }

      replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchText, currentSearchParams, pathname, replace]);

  const sort = {
    sKey: searchParams.sKey,
    sVal: searchParams.sVal,
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set('status', value);
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handlePlanChange = (value: string) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    params.set('plan', value);
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const statusOptions: SelectOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Blocked', value: 'inactive' },
  ];

  const planOptions: SelectOption[] = [
    { label: 'Free', value: 'free' },
    { label: 'Premium', value: 'premium' },
  ];

  const statCards = [
    { label: 'Total users', value: stats.totalUsers.toLocaleString() },
    { label: 'Premium users', value: stats.premiumUsers.toLocaleString() },
    { label: 'Free users', value: stats.freeUsers.toLocaleString() },
    { label: 'Online users', value: '24' },
    { label: 'Ave. time spent / user / day', value: '1h 13m' },
  ];

  return (
    <div className='flex h-full flex-col gap-4'>
      <h2 className='text-xl font-medium tracking-tight text-white'>Overview</h2>

      <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5'>
        {statCards.map((card, i) => (
          <div key={i} className='flex flex-col overflow-hidden rounded-lg bg-card'>
            <div className='flex flex-col gap-2 px-4 py-3 md:px-5'>
              <span className='text-xl font-medium tracking-tight text-white md:text-2xl'>{card.value}</span>
              <span className='text-sm text-muted-foreground md:text-base'>{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className='flex items-center justify-between rounded-md bg-warning px-4 py-2'>
        , <span className='text-sm font-medium text-background'>12 items flagged</span>
        <button className='rounded bg-white px-6 py-1.5 text-sm font-medium text-background'>Review</button>
      </div>

      <div className='flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-white'>Users</span>
        <div className='flex items-center gap-3'>
          <SelectSearchSingle
            value={searchParams.status}
            options={statusOptions}
            placeholder='Status'
            onChange={handleStatusChange}
            onClear={() => {
              const params = new URLSearchParams(currentSearchParams.toString());
              params.delete('status');
              params.set('page', '1');
              replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            }}
            className='w-[140px]'
          />
          <SelectSearchSingle
            value={searchParams.plan}
            options={planOptions}
            placeholder='Plan'
            onChange={handlePlanChange}
            onClear={() => {
              const params = new URLSearchParams(currentSearchParams.toString());
              params.delete('plan');
              params.set('page', '1');
              replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
            }}
            className='w-[140px]'
          />
          <div className='flex h-10 w-[298px] items-center gap-3 rounded-[40px] border border-border bg-background px-4'>
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
              onChange={(event) => {
                setSearchText(event.target.value);
              }}
              placeholder='Search for user'
              className='w-full bg-transparent text-sm font-medium text-white placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
        </div>
      </div>

      <div className='flex-1 flex flex-col min-h-0'>
        {/* <UserFilterControl totalRecords={data.totalRecords} /> */}
        <UserDataTableClient
          data={data}
          sort={sort}
          additionalActions={additionalActions}
          onAdditionalActionClick={onAdditionalActionClick}
        />
      </div>
    </div>
  );
};
