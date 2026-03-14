'use client';

import { FlashcardDetailResponseType, FlashcardListResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { ScrollArea } from '@repo/ui/component/ui/scroll-area';
import { cn } from '@repo/ui/lib/utils';
import { LayoutList, Pencil, Plus, Table2, Trash2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ChapterFilter } from '@/app/lib/container/chapter-filter';
import { ThemeFilter } from '@/app/lib/container/theme-filter';
import { TopicFilter } from '@/app/lib/container/topic-filter';
import { getFlashcardById } from '@/lib/action/flashcard.actions';

import { FlashcardDeleteDialog } from './container/flashcard-delete.dialog';
import { FlashcardUpsertDrawer } from './container/flashcard-upsert.drawer';
import { FlashcardDataTableClient } from './flashcard.datatable';

interface Props {
  data: PaginatedResponseType<FlashcardListResponseType>;
  searchParams: SearchParamsType;
}

export const FlashcardData = ({ data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDetailResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFlashcard, setDeletingFlashcard] = useState<FlashcardListResponseType | null>(null);

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
    setEditingFlashcard(null);
    setDrawerOpen(true);
  };

  const handleEdit = async (flashcard: FlashcardListResponseType) => {
    const detail = await getFlashcardById(flashcard.id);
    setEditingFlashcard(detail);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    refresh();
  };

  const handleDelete = (flashcard: FlashcardListResponseType) => {
    setDeletingFlashcard(flashcard);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    refresh();
  };

  const handleThemeChange = (selectedThemeIds: number[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (selectedThemeIds.length > 0) {
      params.set('themeIds', selectedThemeIds.join(','));
    } else {
      params.delete('themeIds');
    }
    params.set('page', '1');
    const nextQueryString = params.toString();
    replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
  };

  const handleChapterChange = (selectedChapterId: number | undefined) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (selectedChapterId) {
      params.set('chapterId', String(selectedChapterId));
    } else {
      params.delete('chapterId');
    }
    params.delete('topicId');
    params.set('page', '1');
    const nextQueryString = params.toString();
    replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
  };

  const handleTopicChange = (selectedTopicId: number | undefined) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (selectedTopicId) {
      params.set('topicId', String(selectedTopicId));
    } else {
      params.delete('topicId');
    }
    params.set('page', '1');
    const nextQueryString = params.toString();
    replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname);
  };

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-baseline gap-2'>
          <span className='text-xl font-medium tracking-tight text-white'>Flashcards</span>
          <span className='text-xl font-medium tracking-tight text-muted-foreground'>{data.totalRecords}</span>
        </div>
        <Button className='rounded-[40px]' onClick={handleAddNew}>
          <Plus className='h-4 w-4' />
          Add new flashcard
        </Button>
      </div>

      {/* View toggle + Filters + Search */}
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
          <ThemeFilter values={searchParams.themeIds} onChange={handleThemeChange} />
          <ChapterFilter value={searchParams.chapterId} onChange={handleChapterChange} />
          <TopicFilter chapterId={searchParams.chapterId} value={searchParams.topicId} onChange={handleTopicChange} />
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
              placeholder='Search for flashcard'
              className='w-full bg-transparent text-sm font-medium text-white placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
          <FlashcardDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      ) : (
        <>
          <ScrollArea className='min-h-0 flex-1'>
            <div className='center-container'>
              <div className='mx-auto flex w-full max-w-[1000px] flex-col gap-3'>
                {data.results.map((flashcard) => (
                  <div key={flashcard.id} className='flex flex-col gap-4 rounded-xl bg-card px-6 pb-4 pt-6'>
                    <div className='flex flex-col gap-4'>
                      <div>
                        <span className='text-sm font-medium text-muted-foreground'>Front</span>
                        <p className='mt-1 text-base text-white'>{flashcard.contentFront}</p>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-muted-foreground'>Back</span>
                        <p className='mt-1 text-base text-secondary-foreground'>{flashcard.contentBack}</p>
                      </div>

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <div>
                          <span className='text-sm font-medium text-muted-foreground'>Chapter</span>
                          <p className='mt-1 text-base text-secondary-foreground'>{flashcard.chapter.title}</p>
                        </div>
                        <div>
                          <span className='text-sm font-medium text-muted-foreground'>Topic</span>
                          <p className='mt-1 text-base text-secondary-foreground'>{flashcard.topic.title}</p>
                        </div>
                      </div>
                      <div>
                        <span className='text-sm font-medium text-muted-foreground'>Themes</span>
                        {flashcard.themes.length > 0 ? (
                          <div className='mt-1.5 flex flex-wrap gap-1.5'>
                            {flashcard.themes.map((theme) => (
                              <span key={theme.id} className='inline-flex items-center rounded-md border border-border bg-background/10 px-2.5 py-1 text-xs text-white'>
                                {theme.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className='mt-1 text-sm text-muted-foreground'>None</p>
                        )}
                      </div>
                    </div>

                    <div className='border-t border-border' />

                    <div className='flex items-center gap-4'>
                      <button
                        onClick={() => handleEdit(flashcard)}
                        className='flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3.5 transition-colors hover:bg-border/50 active:bg-border'
                      >
                        <Pencil className='h-4 w-4 text-white' />
                        <span className='text-sm font-medium text-white'>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(flashcard)}
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
          <footer className='shrink-0 border-t border-border'>
            <div className='center-container flex items-center justify-end py-4'>
              <button className='rounded-lg border border-border px-4 text-base text-white'>Next</button>
            </div>
          </footer>
        </>
      )}

      <FlashcardUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} flashcard={editingFlashcard} onSuccess={handleDrawerSuccess} />

      <FlashcardDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} flashcard={deletingFlashcard} onSuccess={handleDeleteSuccess} />
    </div>
  );
};
