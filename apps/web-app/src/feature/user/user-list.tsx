'use client';

import { DataTableSimple } from '@repo/ui/container/datatable/datatable';
import { ActionOption, ActionsIconCellRenderer, BadgeRenderer, DateTimeRenderer } from '@repo/ui/container/datatable/datatable-cell-renderer';
import { ColDef } from 'ag-grid-community';
import { Ban, Pencil, TrendingDown } from 'lucide-react';
import { useMediaQuery } from 'usehooks-ts';

type UserRow = {
  id: number;
  name: string;
  email: string;
  profileId: string;
  dateJoined: string;
  plan: string;
  lastLogIn: string;
};

const statCards = [
  { label: 'Total users', value: '2,480' },
  { label: 'Premium users', value: '859' },
  { label: 'Online users', value: '83' },
  { label: 'Ave. time spent / user / day', value: '1h 13m' },
  { label: 'Online users', value: '24' },
];

const tableRows: UserRow[] = Array.from({ length: 11 }, (_, i) => ({
  id: i + 1,
  name: 'Goziem Ajulibe',
  email: 'sharon.amarachi@gmail.com',
  profileId: 'd4d199bc8740',
  dateJoined: new Date().toISOString(),
  plan: 'Premium',
  lastLogIn: new Date().toISOString(),
}));

const actionOptions: ActionOption[] = [
  { name: 'Edit', icon: Pencil, variant: 'outline' },
  { name: 'Downgrade', icon: TrendingDown, variant: 'outline' },
  { name: 'Block', icon: Ban, variant: 'outline-danger' },
];

const colDefs: ColDef<UserRow>[] = [
  {
    field: 'name',
    headerName: 'Names',
    flex: 1,
    minWidth: 150,
    sortable: true,
  },
  {
    field: 'email',
    headerName: 'Email',
    flex: 1,
    minWidth: 180,
    sortable: true,
  },
  {
    field: 'profileId',
    headerName: 'Profile ID',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'dateJoined',
    headerName: 'Date joined',
    flex: 1,
    minWidth: 160,
    sortable: true,
    cellRenderer: (params: { value: string }) => <DateTimeRenderer value={params.value} />,
  },
  {
    field: 'plan',
    headerName: 'Plan',
    flex: 1,
    minWidth: 100,
    cellRenderer: (params: { value: string }) => <BadgeRenderer text={params.value} className="bg-primary/20 text-primary" />,
  },
  {
    field: 'lastLogIn',
    headerName: 'Last log in',
    flex: 1,
    minWidth: 160,
    sortable: true,
    cellRenderer: (params: { value: string }) => <DateTimeRenderer value={params.value} />,
  },
  {
    field: 'actions' as keyof UserRow,
    headerName: '',
    width: 140,
    resizable: false,
    cellRenderer: ActionsIconCellRenderer,
    cellRendererParams: {
      options: actionOptions,
    },
  },
];

export function UserList() {
  const isMobile = useMediaQuery('(max-width: 1023px)');

  const handleActionClick = (action: string, data: UserRow) => {
    console.log('Action clicked:', action, data);
  };

  const handleCellClick = (data: UserRow, colId: string) => {
    console.log('Cell clicked:', colId, data);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <h2 className="text-xl font-medium tracking-tight text-white">Overview</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-lg bg-card">
            <div className="flex flex-col gap-2 px-4 py-3 md:px-5">
              <span className="text-xl font-medium tracking-tight text-white md:text-2xl">{card.value}</span>
              <span className="text-sm text-muted-foreground md:text-base">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-md bg-warning px-4 py-2">
        <span className="text-sm font-medium text-background">12 items flagged</span>
        <button className="rounded bg-white px-6 py-1.5 text-sm font-medium text-background">Review</button>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xl font-medium tracking-tight text-white">Users</span>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-[40px] border border-border bg-background px-3">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.33 12.67A5.33 5.33 0 1 0 7.33 2a5.33 5.33 0 0 0 0 10.67ZM14 14l-2.9-2.9" stroke="#848A91" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-muted-foreground">Filter</span>
          </div>
          <div className="flex h-10 w-[298px] items-center gap-3 rounded-[40px] border border-border bg-background px-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.33 12.67A5.33 5.33 0 1 0 7.33 2a5.33 5.33 0 0 0 0 10.67ZM14 14l-2.9-2.9" stroke="#848A91" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-medium text-white">Search for user</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <DataTableSimple<UserRow>
          tableKey="user-list"
          rowData={tableRows}
          colDefs={colDefs}
          pagination={{ page: 1, pageSize: 10, total: tableRows.length }}
          onActionClick={handleActionClick}
          onCellClick={handleCellClick}
          autoHeight={isMobile}
        />
      </div>
    </div>
  );
}
