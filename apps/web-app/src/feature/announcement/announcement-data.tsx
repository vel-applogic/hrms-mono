'use client';

import type { AnnouncementResponseType, BranchResponseType, DepartmentResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AnnouncementDeleteDialog } from './container/announcement-delete.dialog';
import { AnnouncementUpsertModal } from './container/announcement-upsert.modal';
import { AnnouncementViewDrawer } from './container/announcement-view.drawer';
import { AnnouncementDataTableClient } from './announcement.datatable';

interface Props {
  data: PaginatedResponseType<AnnouncementResponseType>;
  searchParams: SearchParamsType;
  branches: BranchResponseType[];
  departments: DepartmentResponseType[];
  readOnly?: boolean;
}

export function AnnouncementData({ data, searchParams, branches, departments, readOnly }: Props) {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<AnnouncementResponseType | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingAnnouncementId, setViewingAnnouncementId] = useState<number | null>(null);

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

  const handleView = (announcement: AnnouncementResponseType) => {
    setViewingAnnouncementId(announcement.id);
    setViewDrawerOpen(true);
  };

  const handleEdit = (announcement: AnnouncementResponseType) => {
    setEditingAnnouncement(announcement);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setModalOpen(true);
  };

  const handleModalSuccess = () => {
    refresh();
  };

  const handleDelete = (announcement: AnnouncementResponseType) => {
    setDeletingAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    refresh();
  };

  const handleClearAll = () => {
    setSearchText('');
    replace(pathname);
  };

  const hasActiveFilters = searchText.trim().length > 0 || (searchParams.search?.trim().length ?? 0) > 0;

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
              placeholder='Search for announcement'
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
          <Button className='rounded-[40px]' onClick={handleCreate}>
            <Plus className='h-4 w-4' />
            Add announcement
          </Button>
        )}
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0'>
        <AnnouncementDataTableClient data={data} sort={sort} onView={handleView} onEdit={readOnly ? undefined : handleEdit} onDelete={readOnly ? undefined : handleDelete} />
      </div>

      <AnnouncementUpsertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        announcement={editingAnnouncement}
        branches={branches}
        departments={departments}
        onSuccess={handleModalSuccess}
      />

      <AnnouncementDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} announcement={deletingAnnouncement} onSuccess={handleDeleteSuccess} />

      <AnnouncementViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} announcementId={viewingAnnouncementId} />
    </div>
  );
}
