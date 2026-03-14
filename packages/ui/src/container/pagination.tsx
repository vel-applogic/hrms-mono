'use client';
import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../component/shadcn/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../component/shadcn/pagination';
import { cn } from '../lib/utils';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  tableKey: string;
  className?: string;
}

export const MapPagination = (props: Props) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <CurrentResultsIndicator total={props.total} page={props.page} pageSize={props.pageSize} tableKey={props.tableKey} />
      <PaginationRow type="simple" page={props.page} pageSize={props.pageSize} total={props.total} className={cn('mx-0 w-auto shrink-0', props.className)} />
    </div>
  );
};

export const DataTableFullPagination = (props: Props) => {
  return (
    <div className="flex flex-row items-center justify-between">
      <CurrentResultsIndicator total={props.total} page={props.page} pageSize={props.pageSize} tableKey={props.tableKey} />
      <PaginationRow type="numbers" page={props.page} pageSize={props.pageSize} total={props.total} className={cn('mx-0 w-auto shrink-0', props.className)} />
      <PerPageSelection pageSize={props.pageSize} />
    </div>
  );
};

export const DataTableSimplePagination = (props: Props) => {
  return (
    <div className="flex flex-row items-center space-x-4">
      <PaginationRow type="numbers" page={props.page} pageSize={props.pageSize} total={props.total} className={cn('mx-0 w-auto shrink-0', props.className)} />
    </div>
  );
};

interface PaginationRowProps {
  type: 'simple' | 'numbers';
  page: number;
  pageSize: number;
  total: number;
  className?: string;
}
const PaginationRow = (props: PaginationRowProps) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  if (props.type === 'numbers') {
    return <NumbersPaginationRow page={props.page} pageSize={props.pageSize} total={props.total} updatePage={updatePage} className={props.className} />;
  }

  return <SimplePaginationRow page={props.page} pageSize={props.pageSize} total={props.total} updatePage={updatePage} className={props.className} />;
};

const SimplePaginationRow = (props: { page: number; pageSize: number; total: number; updatePage: (p: number) => void; className?: string }) => {
  const paginationRange = usePagination({
    currentPage: props.page,
    totalCount: props.total,
    siblingCount: 2,
    additionalPageCount: 3,
    pageSize: props.pageSize,
  });

  const totalPageCount = Math.ceil(props.total / props.pageSize);

  if (!paginationRange || paginationRange.length < 2) {
    return null;
  }

  return (
    <Pagination className={props.className}>
      <PaginationContent>
        {props.page > 1 && (
          <PaginationPrevious
            className="cursor-pointer text-muted-foreground hover:bg-card hover:text-foreground"
            onClick={() => {
              props.updatePage(props.page - 1);
            }}
          />
        )}

        {props.page < totalPageCount && (
          <PaginationNext
            className="cursor-pointer text-muted-foreground hover:bg-card hover:text-foreground"
            onClick={() => {
              props.updatePage(props.page + 1);
            }}
          />
        )}
      </PaginationContent>
    </Pagination>
  );
};

const NumbersPaginationRow = (props: { page: number; pageSize: number; total: number; updatePage: (p: number) => void; className?: string }) => {
  const paginationRange = usePagination({
    currentPage: props.page,
    totalCount: props.total,
    siblingCount: 2,
    additionalPageCount: 3,
    pageSize: props.pageSize,
  });

  const totalPageCount = Math.ceil(props.total / props.pageSize);

  if (!paginationRange || paginationRange.length < 2) {
    return null;
  }

  return (
    <Pagination className={props.className}>
      <PaginationContent>
        {props.page > 1 && (
          <PaginationPrevious
            className="cursor-pointer text-muted-foreground hover:bg-card hover:text-foreground"
            onClick={() => {
              props.updatePage(props.page - 1);
            }}
          />
        )}
        {(paginationRange as (number | null)[]).map((p, i) => {
          if (p != null) {
            return (
              <PaginationLink
                isActive={p === props.page}
                key={i}
                className={cn('cursor-pointer', p === props.page ? 'border-primary bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-card hover:text-foreground')}
                onClick={() => {
                  props.updatePage(p);
                }}
              >
                {p}
              </PaginationLink>
            );
          }
          return <PaginationEllipsis key={i} className="text-muted-foreground" />;
        })}
        {props.page < totalPageCount && (
          <PaginationNext
            className="cursor-pointer text-muted-foreground hover:bg-card hover:text-foreground"
            onClick={() => {
              props.updatePage(props.page + 1);
            }}
          />
        )}
      </PaginationContent>
    </Pagination>
  );
};

const PerPageSelection = (props: { pageSize: number }) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updatePageSize = (size: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('pageSize', size.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  const perPageSelection = useMemo(() => {
    const vals = [10, 50, 100, 200];
    if (process.env.NEXT_PUBLIC_APP_ENV != 'prod') {
      vals.unshift(2);
    }
    return vals;
  }, []);

  return (
    <div className="text-sm text-muted-foreground">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex flex-row items-center gap-1 rounded-lg bg-card px-3 py-1 text-sm">
            <div>Page size:</div>
            <div className="font-semibold">{props.pageSize}</div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Page size</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {perPageSelection.map((p, index) => (
            <DropdownMenuItem className={cn(p == props.pageSize && 'bg-primary text-primary-foreground')} key={index} onClick={() => updatePageSize(p)}>
              {p}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const usePagination = ({
  totalCount,
  pageSize,
  siblingCount = 1,
  currentPage,
}: {
  totalCount: number;
  pageSize: number;
  siblingCount: number;
  currentPage: number;
  additionalPageCount: number;
}) => {
  const DOTS = null;
  const paginationRange = useMemo(() => {
    const totalPageCount = Math.ceil(totalCount / pageSize);

    // Pages count is determined as siblingCount + firstPage + lastPage + currentPage + 2*DOTS
    const totalPageNumbers = siblingCount + 5;

    /*
      Case 1:
      If the number of pages is less than the page numbers we want to show in our
      paginationComponent, we return the range [1..totalPageCount]
    */
    if (totalPageNumbers >= totalPageCount) {
      return range(1, totalPageCount);
    }

    /*
    	Calculate left and right sibling index and make sure they are within range 1 and totalPageCount
    */
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPageCount);

    /*
      We do not show dots just when there is just one page number to be inserted between the extremes of sibling and the page limits i.e 1 and totalPageCount. Hence we are using leftSiblingIndex > 2 and rightSiblingIndex < totalPageCount - 2
    */
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    /*
    	Case 2: No left dots to show, but rights dots to be shown
    */
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);

      return [...leftRange, DOTS, totalPageCount];
    }

    /*
    	Case 3: No right dots to show, but left dots to be shown
    */
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPageCount - rightItemCount + 1, totalPageCount);
      return [firstPageIndex, DOTS, ...rightRange];
    }

    /*
    	Case 4: Both left and right dots to be shown
    */
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
  }, [totalCount, pageSize, siblingCount, currentPage]);

  return paginationRange;
};

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, idx) => idx + start);
};

const CurrentResultsIndicator = (props: { total: number; page: number; pageSize: number; tableKey: string }) => {
  const upto = Math.min(props.page * props.pageSize, props.total);

  return <div className="text-xs text-muted-foreground">{props.total ? `Results: ${props.page}-${upto} of ${props.total} ${props.tableKey}` : 'No records to show'}</div>;
};
