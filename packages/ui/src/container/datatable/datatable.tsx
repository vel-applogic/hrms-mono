'use client';
import {
  AllCommunityModule,
  AutoGroupColumnDef,
  CellClickedEvent,
  CellEditingStoppedEvent,
  ColDef,
  ColumnResizedEvent,
  GridReadyEvent,
  ModuleRegistry,
  RowClassParams,
  RowSelectionOptions,
  SelectionChangedEvent,
  SortDirection,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { cn } from '../../lib/utils';
import { DataTableFullPagination, DataTableSimplePagination } from '../pagination';
import { datatableTheme } from './datatable-theme';

ModuleRegistry.registerModules([AllCommunityModule]);

export interface PropsPagination {
  page: number;
  pageSize: number;
  total: number;
}

interface PropsSimple<T> {
  tableKey: string;
  pagination: PropsPagination;
  rowData: T[];
  colDefs: ColDef<T>[];
  onCellClick?: (data: T, col: string) => void;
  onActionClick?: (action: string, data: T) => void;
  onCellValueChange?: (rowIndex: number, col: string, value: T) => void;
  getRowClass?: (params: RowClassParams<T>) => string;
  autoHeight?: boolean;
}

export function DataTableSimple<Result = [Error, 'Specify the Data type parameter'], T extends Result = Result>(props: PropsSimple<T>) {
  return (
    <DataTableContainer
      tableKey={props.tableKey}
      rowData={props.rowData}
      pagination={props.pagination}
      colDefs={props.colDefs}
      onCellClick={props.onCellClick}
      onActionClick={props.onActionClick}
      onCellValueChange={props.onCellValueChange}
      getRowClass={props.getRowClass}
      shrink={props.autoHeight}
    />
  );
}

interface PropsDataTableMultiSelect<T> extends PropsSimple<T> {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  rowSelectionOptions?: RowSelectionOptions<T>;
  hideCheckboxes?: boolean;
}
export function DataTableMultiSelect<Result = [Error, 'Specify the Data type parameter'], T extends Result = Result>(props: PropsDataTableMultiSelect<T>) {
  const rowSelectionOptions = props.rowSelectionOptions ?? {};
  return (
    <DataTableContainer
      tableKey={props.tableKey}
      rowData={props.rowData}
      pagination={props.pagination}
      colDefs={props.colDefs}
      onCellClick={props.onCellClick}
      onActionClick={props.onActionClick}
      onSelectionChange={props.onSelectionChange}
      onCellValueChange={props.onCellValueChange}
      getRowClass={props.getRowClass}
      selectedIds={props.selectedIds}
      rowSelectionOptions={{
        ...rowSelectionOptions,
        mode: 'multiRow',
        headerCheckbox: false,
      }}
      hideCheckboxes={props.hideCheckboxes}
      shrink={props.autoHeight}
    />
  );
}

interface PropsSimpleWithFooter<T> extends PropsSimple<T> {
  footerActions: React.ReactNode;
}

export function DataTableSimpleWithFooter<Result = [Error, 'Specify the Data type parameter'], T extends Result = Result>(props: PropsSimpleWithFooter<T>) {
  return (
    <DataTableContainer
      tableKey={props.tableKey}
      rowData={props.rowData}
      pagination={props.pagination}
      colDefs={props.colDefs}
      onCellClick={props.onCellClick}
      onActionClick={props.onActionClick}
      onCellValueChange={props.onCellValueChange}
      getRowClass={props.getRowClass}
      footerActions={props.footerActions}
      shrink={props.autoHeight}
    />
  );
}

interface PropsMultiSelectWithFooter<T> extends PropsSimple<T> {
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  rowSelectionOptions?: RowSelectionOptions<T>;
  footerActions: React.ReactNode;
}
export function DataTableMultiSelectWithFooter<Result = [Error, 'Specify the Data type parameter'], T extends Result = Result>(props: PropsMultiSelectWithFooter<T>) {
  const rowSelectionOptions = props.rowSelectionOptions ?? {};
  return (
    <DataTableContainer
      tableKey={props.tableKey}
      rowData={props.rowData}
      pagination={props.pagination}
      colDefs={props.colDefs}
      onCellClick={props.onCellClick}
      onActionClick={props.onActionClick}
      onSelectionChange={props.onSelectionChange}
      onCellValueChange={props.onCellValueChange}
      getRowClass={props.getRowClass}
      footerActions={props.footerActions}
      rowSelectionOptions={{
        ...rowSelectionOptions,
        mode: 'multiRow',
        headerCheckbox: false,
      }}
      selectedIds={props.selectedIds}
      shrink={props.autoHeight}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DummySort = (vala: any, valb: any, nodea: any, _nodeb: any, _isInverted: any) => nodea;

export const getSort = (name: string, sKey?: string, sVal?: string): SortDirection => {
  if (sKey == name) {
    return sVal == 'desc' ? 'desc' : 'asc';
  }
  return null;
};

// --- Internal DataTableContainer (not exported) ---

interface DataTableContainerProps<T> {
  tableKey: string;
  pagination?: PropsPagination;
  rowData: T[];
  colDefs: ColDef<T>[];
  onCellClick?: (data: T, col: string) => void;
  onActionClick?: (action: string, data: T) => void;
  onSelectionChange?: (ids: number[]) => void;
  onCellValueChange?: (rowIndex: number, col: string, value: T) => void;
  shrink?: boolean;
  hidePagination?: boolean;
  footerActions?: React.ReactNode;
  selectedIds?: number[];
  getRowClass?: (params: RowClassParams<T>) => string;
  rowSelectionOptions?: RowSelectionOptions<T>;
  hideCheckboxes?: boolean;
}

interface SavedColumnState {
  colId: string;
  width: number;
  flex?: number | null;
}

const DataTableContainer = <T,>(props: DataTableContainerProps<T>) => {
  const [savedColumnWidths, setSavedColumnWidths] = useLocalStorage<SavedColumnState[]>(`hrms-col-widths-${props.tableKey}`, []);

  const gridRef = useRef<AgGridReact>(null);
  const previousSortRef = useRef<{ colId: string; sort: string } | null>(null);

  const theme = useMemo(() => {
    return datatableTheme.withParams({
      spacing: 10,
      rowHoverColor: '#E4E9E6',
      headerHeight: '50px',
      fontFamily: 'DM Sans',
      selectedRowBackgroundColor: '#E4E9E6',
      checkboxCheckedBackgroundColor: '#1B4332',
      checkboxCheckedShapeColor: 'white',
      checkboxUncheckedBackgroundColor: 'transparent',
      checkboxUncheckedBorderColor: '#C8D3CD',
      wrapperBorderRadius: 0,
      borderRadius: 0,
      headerTextColor: '#d4e8dc',
      headerFontWeight: '700',
      backgroundColor: '#FFFFFF',
      chromeBackgroundColor: '#FFFFFF',
      foregroundColor: '#0F1F16',
      headerBackgroundColor: '#1e5a40',
      headerColumnBorder: { style: 'solid', color: '#2a7a56' },
      rowBorder: { style: 'solid', color: '#C8D3CD' },
      columnBorder: { style: 'solid', color: '#C8D3CD' },
      wrapperBorder: {
        width: 1,
        color: '#C8D3CD',
      },
    });
  }, []);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updateSort = (sortKey: string, sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('sKey', sortKey);
    params.set('sVal', sortValue);
    replace(`${pathname}?${params.toString()}`);
  };

  const removeSort = () => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.delete('sKey');
    params.delete('sVal');
    replace(`${pathname}?${params.toString()}`);
  };

  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      // Apply sort state from URL
      const sKey = searchParams.get('sKey');
      const sVal = searchParams.get('sVal');
      if (sKey && sVal) {
        event.api.applyColumnState({
          state: [{ colId: sKey, sort: sVal as 'asc' | 'desc' }],
          defaultState: { sort: null },
        });
        // Initialize previousSortRef with URL params
        previousSortRef.current = { colId: sKey, sort: sVal };
      } else {
        // Check if any column has a default sort (from colDef)
        const colState = event.api.getColumnState();
        const sortedCol = colState.find((col) => col.sort != null);
        if (sortedCol && sortedCol.sort) {
          // Initialize previousSortRef with default sort
          previousSortRef.current = { colId: sortedCol.colId, sort: sortedCol.sort };
        }
      }

      // Apply saved column widths if available
      if (savedColumnWidths.length > 0) {
        const columnState = savedColumnWidths.map((col) => ({
          colId: col.colId,
          width: col.width,
          flex: col.flex ?? null,
        }));

        event.api.applyColumnState({
          state: columnState,
          applyOrder: false,
        });
      }
    },
    [savedColumnWidths, searchParams],
  );

  const onColumnResized = useCallback(
    (event: ColumnResizedEvent) => {
      // Only save when user manually resizes and the resize is finished
      if (!event.finished || event.source !== 'uiColumnResized') {
        return;
      }

      const allColumnState = event.api.getColumnState();
      const columnWidths: SavedColumnState[] = allColumnState
        .filter((col) => {
          const colDef = event.api.getColumnDef(col.colId);
          return colDef?.resizable !== false && col.width != null && col.width > 0;
        })
        .map((col) => ({
          colId: col.colId,
          width: col.width!,
          flex: col.flex,
        }));

      setSavedColumnWidths(columnWidths);
    },
    [setSavedColumnWidths],
  );

  const onClickActions = (action: string, data: T) => {
    if (props.onActionClick) {
      props.onActionClick(action, data);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onCellEditingStopped = useCallback((event: CellEditingStoppedEvent<any>) => {
    if (event.rowIndex !== null && event.colDef.field && props.onCellValueChange) {
      props.onCellValueChange(event.rowIndex, event.colDef.field, event.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getRowId = ({ data }: { data: any }) => `row-${data.id}`;

  useEffect(() => {
    if (props.rowSelectionOptions != null && props.selectedIds != null) {
      if (props.selectedIds.length) {
        gridRef.current?.api?.forEachNode((node) => {
          if (props.selectedIds?.includes(node.data.id)) {
            node.setSelected(true);
          } else {
            node.setSelected(false);
          }
        });
      } else {
        gridRef.current?.api?.deselectAll();
      }
    }
  }, [props.rowSelectionOptions, props.selectedIds]);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      suppressMovable: true,
      sortable: false,
      resizable: true,
      cellStyle: {
        display: 'flex',
        height: '100%',
        justifyContent: 'start',
        alignItems: 'center',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
    };
  }, []);

  const autoGroupColumnDef = useMemo<AutoGroupColumnDef<T>>(() => {
    return {
      minWidth: 200,
    };
  }, []);

  return (
    <div className='flex h-full w-full flex-col'>
      <div className={cn('ag-theme-quartz w-full flex-grow')}>
        <AgGridReact<T>
          getRowId={getRowId}
          theme={theme}
          columnDefs={props.colDefs}
          containerStyle={{ height: '100%', width: '100%' }}
          animateRows={false}
          context={{
            onClickActions,
          }}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          gridOptions={{
            domLayout: props.shrink ? 'autoHeight' : 'normal',
            suppressColumnMoveAnimation: true,
            suppressRowTransform: true,
            suppressAnimationFrame: true,
            alwaysShowHorizontalScroll: true,
          }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onCellClicked={(e: CellClickedEvent<any>) => {
            if (e.column.getColId() != 'actions' && e.column.getColId() != 'select' && props.onCellClick) {
              const target = e.event?.target as HTMLElement;
              if (target) {
                // Check if click was on an interactive element (button, input, etc.)
                const interactiveElements = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
                const isInteractive = interactiveElements.includes(target.tagName) || target.closest('button, input, textarea, select, [role="button"]');
                if (isInteractive) {
                  return;
                }
              }
              props.onCellClick(e.data, e.column.getColId());
            }
          }}
          onCellEditingStopped={onCellEditingStopped}
          onColumnResized={onColumnResized}
          onGridReady={onGridReady}
          onSelectionChanged={(event: SelectionChangedEvent<T>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const selectedIds = event.api.getSelectedRows().map((s) => (s as any).id);
            props.onSelectionChange?.(selectedIds);
          }}
          onRowDataUpdated={() => {
            if (!gridRef.current?.api) return;
            // Force-refresh all cells after AG Grid has finished processing the new row data.
            // This ensures cell renderers that render fields not tracked by AG Grid's change
            // detection (e.g. `themes` inside a cell whose colDef declares field: 'content')
            // still re-render with the latest values.
            gridRef.current.api.refreshCells({ force: true });
            gridRef.current.api.resetRowHeights();
          }}
          onSortChanged={(event) => {
            if (!gridRef.current || event.source != 'uiColumnSorted') {
              return;
            }

            // Get current state after the change
            const colState = gridRef.current.api.getColumnState();
            const sortState = colState
              .filter(function (s) {
                return s.sort != null;
              })
              .map(function (s) {
                return { colId: s.colId, sort: s.sort, sortIndex: s.sortIndex };
              });

            if (sortState?.length) {
              // User sorted to a specific direction (asc/desc)
              updateSort(sortState[0]!.colId, sortState[0]!.sort!);
              // Store this sort for next time
              previousSortRef.current = { colId: sortState[0]!.colId, sort: sortState[0]!.sort! };
            } else {
              // User clicked to remove sort (ag-grid went from sorted -> unsorted)
              // We want bi-state cycling: DESC <-> ASC (no "no sort" state)

              // Use the previous sort from our ref
              const previousSort = previousSortRef.current;

              if (previousSort) {
                // Flip to opposite direction instead of removing sort
                const oppositeSortVal = previousSort.sort === 'desc' ? 'asc' : 'desc';
                updateSort(previousSort.colId, oppositeSortVal);
                // Update the ref
                previousSortRef.current = { colId: previousSort.colId, sort: oppositeSortVal };
                // Re-apply the sort state to ag-grid so it shows the correct icon
                setTimeout(() => {
                  gridRef.current?.api.applyColumnState({
                    state: [{ colId: previousSort.colId, sort: oppositeSortVal as 'asc' | 'desc' }],
                    defaultState: { sort: null },
                  });
                }, 0);
              }
            }
          }}
          enableCellTextSelection={true}
          pagination={false}
          suppressCellFocus={true}
          ref={gridRef}
          rowData={props.rowData}
          rowSelection={!props.hideCheckboxes ? props.rowSelectionOptions : undefined}
          getRowClass={props.getRowClass}
          selectionColumnDef={
            props.rowSelectionOptions != null && !props.hideCheckboxes ? { pinned: 'left', resizable: false, width: 60, cellClass: '!flex items-center' } : undefined
          }
        />
      </div>
      {props.pagination != null ? (
        props.footerActions ? (
          <DataTableFooterSimple
            page={props.pagination.page}
            pageSize={props.pagination.pageSize}
            total={props.pagination.total}
            tableKey={props.tableKey}
            footerActions={props.footerActions}
          />
        ) : (
          <DataTableFooterFull page={props.pagination.page} pageSize={props.pagination.pageSize} total={props.pagination.total} tableKey={props.tableKey} />
        )
      ) : null}
    </div>
  );
};

const DataTableFooterSimple = (props: { total: number; pageSize: number; page: number; tableKey: string; footerActions: React.ReactNode }) => {
  return (
    <div className='rounded-b-xl border border-t-0 border-border bg-[#1e5a40] px-4 py-4 text-[#d4e8dc]'>
      <div className='flex flex-row items-center justify-between'>
        <DataTableSimplePagination page={props.page} pageSize={props.pageSize} total={props.total} tableKey={props.tableKey} />
        {props.footerActions}
      </div>
    </div>
  );
};

const DataTableFooterFull = (props: { total: number; pageSize: number; page: number; tableKey: string }) => {
  return (
    <div className='rounded-b-xl border border-t-0 border-border bg-[#1e5a40] px-4 py-4 text-[#d4e8dc]'>
      <DataTableFullPagination page={props.page} pageSize={props.pageSize} total={props.total} tableKey={props.tableKey} />
    </div>
  );
};
