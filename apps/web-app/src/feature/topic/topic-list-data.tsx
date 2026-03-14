'use client';

import { PaginatedResponseType, SearchParamsType, TopicDetailResponseType, TopicListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { ScrollArea } from '@repo/ui/component/ui/scroll-area';
import { cn } from '@repo/ui/lib/utils';
import { LayoutList, Pencil, Plus, Table2, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ChapterFilter } from '@/app/lib/container/chapter-filter';
import { getTopicById } from '@/lib/action/topic.actions';

import { TopicDeleteDialog } from './container/topic-delete.dialog';
import { TopicUpsertDrawer } from './container/topic-upsert.drawer';
import { TopicListDataTableClient } from './topic-list.datatable';

interface Props {
  data: PaginatedResponseType<TopicListResponseType>;
  searchParams: SearchParamsType;
}

export const TopicListData = ({ data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
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

  const handleEdit = async (topic: TopicDetailResponseType) => {
    setEditingTopic(topic);
    setDrawerOpen(true);
  };

  const handleEditFromList = async (topic: TopicListResponseType) => {
    const detail = await getTopicById(topic.id);
    setEditingTopic(detail);
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

  const handleChapterChange = (chapterId: number | undefined) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (chapterId) {
      params.set('chapterId', String(chapterId));
    } else {
      params.delete('chapterId');
    }
    params.set('page', '1');
    const nextQueryString = params.toString();
    replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
  };

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-baseline gap-2'>
          <span className='text-xl font-medium tracking-tight text-white'>Topics</span>
          <span className='text-xl font-medium tracking-tight text-muted-foreground'>{data.totalRecords}</span>
        </div>
        <Button className='rounded-[40px]' onClick={handleAddNew}>
          <Plus className='h-4 w-4' />
          Add new topic
        </Button>
      </div>

      {/* View toggle + Chapter filter + Search */}
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <span className='text-sm font-medium text-white'>View as:</span>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                viewMode === 'table' ? 'border border-border text-white' : 'text-muted-foreground hover:text-white',
              )}
            >
              <Table2 className='h-4 w-4' />
              Table
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                viewMode === 'list' ? 'border border-border text-white' : 'text-muted-foreground hover:text-white',
              )}
            >
              <LayoutList className='h-4 w-4' />
              List
            </button>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <ChapterFilter value={searchParams.chapterId} onChange={handleChapterChange} />
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
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
          <TopicListDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      ) : (
        <ScrollArea className='min-h-0 flex-1'>
          <div className='center-container'>
            <div className='mx-auto flex w-full max-w-[1000px] flex-col gap-3'>
              {data.results.map((topic) => (
                <div key={topic.id} className='flex flex-col gap-4 rounded-xl bg-card px-6 pb-4 pt-6'>
                  <p className='mt-1 text-base text-white'>{topic.title}</p>
                  <div>
                    <span className='text-sm font-medium text-muted-foreground'>Chapter</span>
                    <p className='mt-1 text-sm text-secondary-foreground'>{topic.chapterTitle}</p>
                  </div>

                  <div className='border-t border-border' />

                  <div className='flex items-center gap-4'>
                    <button
                      onClick={() => handleEditFromList(topic)}
                      className='flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3.5 transition-colors hover:bg-border/50 active:bg-border'
                    >
                      <Pencil className='h-4 w-4 text-white' />
                      <span className='text-sm font-medium text-white'>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(topic)}
                      className='flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3.5 transition-colors hover:bg-border/50 active:bg-border'
                    >
                      <Trash2 className='h-4 w-4 text-white' />
                      <span className='text-sm font-medium text-white'>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )}

      <TopicUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} topic={editingTopic} onSuccess={handleDrawerSuccess} />

      <TopicDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} topic={deletingTopic} onSuccess={handleDeleteSuccess} />
    </div>
  );
};
