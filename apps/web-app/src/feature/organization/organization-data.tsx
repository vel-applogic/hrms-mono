'use client';

import {
  OrganizationResponseType,
  PaginatedResponseType,
  SearchParamsType,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useEffect, useRef, useState } from 'react';

import { OrganizationDeleteDialog } from './container/organization-delete.dialog';
import { OrganizationUpsertDrawer } from './container/organization-upsert.drawer';
import { OrganizationDataTableClient } from './organization.datatable';

interface Props {
  data: PaginatedResponseType<OrganizationResponseType>;
  searchParams: SearchParamsType;
}

export const OrganizationData = ({ data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] = useState<OrganizationResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrganization, setDeletingOrganization] = useState<OrganizationResponseType | null>(null);

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
    setEditingOrganization(null);
    setDrawerOpen(true);
  };

  const handleEdit = (organization: OrganizationResponseType) => {
    setEditingOrganization(organization);
    setDrawerOpen(true);
  };

  const handleDelete = (organization: OrganizationResponseType) => {
    setDeletingOrganization(organization);
    setDeleteDialogOpen(true);
  };

  const handleClearAll = () => {
    setSearchText('');
    replace(pathname);
  };

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    (searchParams.search?.trim().length ?? 0) > 0;

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <span className='text-xl font-medium tracking-tight text-foreground'>Organizations</span>
        <Button className='shrink-0 rounded-[40px]' onClick={handleAddNew}>
          <Plus className='h-4 w-4' />
          Add new organization
        </Button>
      </div>

      <div className='center-container flex items-center justify-between gap-3'>
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
              placeholder='Search organizations...'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
        </div>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
        <OrganizationDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <OrganizationUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} organization={editingOrganization} onSuccess={() => refresh()} />

      <OrganizationDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} organization={deletingOrganization} onSuccess={() => refresh()} />
    </div>
  );
};
