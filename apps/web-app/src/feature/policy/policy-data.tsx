'use client';

import { PaginatedResponseType, PolicyDetailResponseType, PolicyListResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { PolicyDeleteDialog } from './container/policy-delete.dialog';
import { PolicyUpsertDrawer } from './container/policy-upsert.drawer';
import { PolicyDataTableClient } from './policy.datatable';

interface Props {
  data: PaginatedResponseType<PolicyListResponseType>;
  searchParams: SearchParamsType;
  readOnly?: boolean;
  basePath?: string;
}

export const PolicyData = ({ data, searchParams, readOnly, basePath }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyDetailResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState<PolicyListResponseType | null>(null);

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

  const sort = {
    sKey: searchParams.sKey,
    sVal: searchParams.sVal,
  };

  const handleEdit = (policy: PolicyDetailResponseType) => {
    setEditingPolicy(policy);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    refresh();
  };

  const handleDelete = (policy: PolicyListResponseType) => {
    setDeletingPolicy(policy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    refresh();
  };

  const handleClearAll = () => {
    setSearchText('');
    replace(pathname);
  };

  const hasActiveFilters =
    searchText.trim().length > 0 || (searchParams.search?.trim().length ?? 0) > 0;

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-[298px] items-center gap-3 rounded-[40px] border border-input bg-white px-4'>
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
              onChange={(event) => setSearchText(event.target.value)}
              placeholder='Search for policy'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={handleClearAll} className='shrink-0'>
              <X className='h-4 w-4' />
              Clear
            </Button>
          )}
        </div>
        {!readOnly && (
          <Link href='/policy/create'>
            <Button className='rounded-[40px]'>
              <Plus className='h-4 w-4' />
              Add new policy
            </Button>
          </Link>
        )}
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0'>
        <PolicyDataTableClient data={data} sort={sort} basePath={basePath} onEdit={readOnly ? undefined : handleEdit} onDelete={readOnly ? undefined : handleDelete} />
      </div>

      <PolicyUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} policy={editingPolicy} onSuccess={handleDrawerSuccess} />

      <PolicyDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} policy={deletingPolicy} onSuccess={handleDeleteSuccess} />
    </div>
  );
};
