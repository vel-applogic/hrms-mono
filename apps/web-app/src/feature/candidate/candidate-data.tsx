'use client';

import { CandidateDetailResponseType, CandidateListResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { CandidateProgressFilter } from '@/app/lib/container/candidate-progress-filter';
import { CandidateSourceFilter } from '@/app/lib/container/candidate-source-filter';
import { CandidateStatusFilter } from '@/app/lib/container/candidate-status-filter';
import { getCandidateById } from '@/lib/action/candidate.actions';

import { CandidateDeleteDialog } from './container/candidate-delete.dialog';
import { CandidateUpsertDrawer } from './container/candidate-upsert.drawer';
import { CandidateDataTableClient } from './candidate.datatable';

interface Props {
  data: PaginatedResponseType<CandidateListResponseType>;
  searchParams: SearchParamsType;
}

export const CandidateData = ({ data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<CandidateDetailResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCandidate, setDeletingCandidate] = useState<CandidateListResponseType | null>(null);

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
    setEditingCandidate(null);
    setDrawerOpen(true);
  };

  const handleEdit = async (candidate: CandidateListResponseType) => {
    const detail = await getCandidateById(candidate.id);
    setEditingCandidate(detail);
    setDrawerOpen(true);
  };

  const handleDelete = (candidate: CandidateListResponseType) => {
    setDeletingCandidate(candidate);
    setDeleteDialogOpen(true);
  };

  const handleStatusChange = (values: string[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('candidateStatus', values.join(','));
    } else {
      params.delete('candidateStatus');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleProgressChange = (values: string[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('candidateProgress', values.join(','));
    } else {
      params.delete('candidateProgress');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSourceChange = (values: string[]) => {
    const params = new URLSearchParams(currentSearchParams.toString());
    if (values.length > 0) {
      params.set('candidateSource', values.join(','));
    } else {
      params.delete('candidateSource');
    }
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    setSearchText('');
    replace(pathname);
  };

  const hasActiveFilters =
    searchText.trim().length > 0 ||
    (searchParams.search?.trim().length ?? 0) > 0 ||
    (searchParams.candidateStatus?.length ?? 0) > 0 ||
    (searchParams.candidateProgress?.length ?? 0) > 0 ||
    (searchParams.candidateSource?.length ?? 0) > 0;

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container'>
        <span className='text-xl font-medium tracking-tight text-white'>Candidates</span>
      </div>

      <div className='center-container flex items-center justify-between gap-3'>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <div className='flex h-10 w-[298px] shrink-0 items-center gap-3 rounded-[40px] border border-border bg-background px-4'>
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
              placeholder='Search candidates...'
              className='w-full bg-transparent text-sm font-medium text-white placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
          <CandidateStatusFilter values={searchParams.candidateStatus} onChange={handleStatusChange} />
          <CandidateProgressFilter values={searchParams.candidateProgress} onChange={handleProgressChange} />
          <CandidateSourceFilter values={searchParams.candidateSource} onChange={handleSourceChange} />
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={handleClearAll} className='shrink-0'>
              <X className='h-4 w-4' />
              Clear
            </Button>
          )}
        </div>
        <Button className='shrink-0 rounded-[40px]' onClick={handleAddNew}>
          <Plus className='h-4 w-4' />
          Add new candidate
        </Button>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0 pb-4'>
        <CandidateDataTableClient data={data} sort={sort} onEdit={handleEdit} onDelete={handleDelete} onRefresh={() => refresh()} />
      </div>

      <CandidateUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} candidate={editingCandidate} onSuccess={() => refresh()} />

      <CandidateDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} candidate={deletingCandidate} onSuccess={() => refresh()} />
    </div>
  );
};
