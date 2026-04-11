'use client';

import { BranchResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BranchDeleteDialog } from './container/branch-delete.dialog';
import { BranchUpsertDrawer } from './container/branch-upsert.drawer';
import { BranchDataTableClient } from './branch.datatable';

interface Props {
  data: PaginatedResponseType<BranchResponseType>;
  searchParams: SearchParamsType;
}

export const BranchData = ({ data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<BranchResponseType | null>(null);

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

  const sort = { sKey: searchParams.sKey, sVal: searchParams.sVal };

  const handleAddNew = () => {
    setEditingBranch(null);
    setDrawerOpen(true);
  };

  const handleEdit = (branch: BranchResponseType) => {
    setEditingBranch(branch);
    setDrawerOpen(true);
  };

  const handleDelete = (branch: BranchResponseType) => {
    setDeletingBranch(branch);
    setDeleteDialogOpen(true);
  };

  const handleClearAll = () => {
    setSearchText('');
    replace(pathname);
  };

  const hasActiveFilters = searchText.trim().length > 0 || (searchParams.search?.trim().length ?? 0) > 0;

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-end justify-between gap-3'>
        <div className='flex flex-wrap items-end gap-3'>
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
                placeholder='Search branches...'
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
        <Button className='shrink-0 rounded-[40px]' onClick={handleAddNew}>
          <Plus className='h-4 w-4' />
          Add new branch
        </Button>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0'>
        <BranchDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} onRefresh={() => refresh()} />
      </div>

      <BranchUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} branch={editingBranch} onSuccess={() => refresh()} />

      <BranchDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} branch={deletingBranch} onSuccess={() => refresh()} />
    </div>
  );
};
