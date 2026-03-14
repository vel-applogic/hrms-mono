'use client';

import { PaginatedResponseType, SearchParamsType, TopicDetailResponseType, TopicListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { TopicDataTableClient } from './topic.datatable';
import { TopicDeleteDialog } from './container/topic-delete.dialog';
import { TopicUpsertDrawer } from './container/topic-upsert.drawer';

interface Props {
  chapterId: number;
  data: PaginatedResponseType<TopicListResponseType>;
  searchParams: SearchParamsType;
}

export const TopicData = ({ chapterId, data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicDetailResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState<TopicListResponseType | null>(null);

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
    setEditingTopic(null);
    setDrawerOpen(true);
  };

  const handleEdit = (topic: TopicDetailResponseType) => {
    setEditingTopic(topic);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    refresh();
  };

  const handleDelete = (topic: TopicListResponseType) => {
    setDeletingTopic(topic);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    refresh();
  };

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <span className='text-base font-medium text-white'>Topics</span>
        <div className='flex items-center gap-3'>
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
              placeholder='Search for topic'
              className='w-full bg-transparent text-sm font-medium text-white placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
          <Button className='rounded-[40px]' onClick={handleAddNew}>
            <Plus className='h-4 w-4' />
            Add new topic
          </Button>
        </div>
      </div>

      <TopicDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} />

      <TopicUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} topic={editingTopic} chapterId={chapterId} onSuccess={handleDrawerSuccess} />

      <TopicDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} topic={deletingTopic} onSuccess={handleDeleteSuccess} />
    </div>
  );
};
