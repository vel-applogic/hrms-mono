'use client';

import { PaginatedResponseType, PolicyDetailResponseType, PolicyFilterRequestType, PolicyListResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { searchPolicies } from '@/lib/action/policy.actions';

import { PolicyDeleteDialog } from './container/policy-delete.dialog';
import { PolicyUpsertDrawer } from './container/policy-upsert.drawer';
import { PolicyDataTableClient } from './policy.datatable';

interface Props {
  filterRequest: PolicyFilterRequestType;
  searchParams: SearchParamsType;
}

export const PolicyData = ({ filterRequest, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [data, setData] = useState<PaginatedResponseType<PolicyListResponseType> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyDetailResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPolicy, setDeletingPolicy] = useState<PolicyListResponseType | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await searchPolicies(filterRequest);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, [filterRequest]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleAddNew = () => {
    setEditingPolicy(null);
    setDrawerOpen(true);
  };

  const handleEdit = (policy: PolicyDetailResponseType) => {
    setEditingPolicy(policy);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    fetchData();
  };

  const handleDelete = (policy: PolicyListResponseType) => {
    setDeletingPolicy(policy);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center pt-4'>
        <p className='text-sm text-muted-foreground'>Loading policies...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-4 pt-4'>
        <p className='text-sm text-destructive'>{error}</p>
        <Button variant='outline' onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-baseline gap-2'>
          <span className='text-xl font-medium tracking-tight text-white'>Policies</span>
          <span className='text-xl font-medium tracking-tight text-muted-foreground'>{data.totalRecords}</span>
        </div>
        <Button className='rounded-[40px]' onClick={handleAddNew}>
          <Plus className='h-4 w-4' />
          Add new policy
        </Button>
      </div>

      <div className='center-container flex items-center justify-end'>
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
            onChange={(event) => setSearchText(event.target.value)}
            placeholder='Search for policy'
            className='w-full bg-transparent text-sm font-medium text-white placeholder:text-muted-foreground focus:outline-none'
          />
        </div>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
        <PolicyDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <PolicyUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} policy={editingPolicy} onSuccess={handleDrawerSuccess} />

      <PolicyDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} policy={deletingPolicy} onSuccess={handleDeleteSuccess} />
    </div>
  );
};
