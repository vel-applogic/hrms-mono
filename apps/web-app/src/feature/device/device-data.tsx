'use client';

import { DeviceDetailResponseType, DeviceResponseType, EmployeeListResponseType, PaginatedResponseType, SearchParamsType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Plus, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { getDeviceById } from '@/lib/action/device.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';

import { DeviceDeleteDialog } from './container/device-delete.dialog';
import { DeviceUpsertDrawer } from './container/device-upsert.drawer';
import { DeviceViewDrawer } from './container/device-view.drawer';
import { DeviceDataTableClient } from './device.datatable';

interface Props {
  data: PaginatedResponseType<DeviceResponseType>;
  searchParams: SearchParamsType;
}

export const DeviceData = ({ data, searchParams }: Props) => {
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  const { replace, refresh } = useRouter();
  const [searchText, setSearchText] = useState(searchParams.search ?? '');
  const prevSearchTextRef = useRef(searchText);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<DeviceDetailResponseType | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [viewingDevice, setViewingDevice] = useState<DeviceDetailResponseType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDevice, setDeletingDevice] = useState<DeviceResponseType | null>(null);
  const [employees, setEmployees] = useState<EmployeeListResponseType[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(
    searchParams.userId && searchParams.userId.length > 0 ? String(searchParams.userId[0]) : '',
  );

  useEffect(() => {
    getEmployeesList().then(setEmployees);
  }, []);

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

  const handleView = async (device: DeviceResponseType) => {
    const detail = await getDeviceById(device.id);
    setViewingDevice(detail);
    setViewDrawerOpen(true);
  };

  const handleEdit = async (device: DeviceResponseType) => {
    const detail = await getDeviceById(device.id);
    setEditingDevice(detail);
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingDevice(null);
    setDrawerOpen(true);
  };

  const handleDrawerSuccess = () => {
    refresh();
  };

  const handleDelete = (device: DeviceResponseType) => {
    setDeletingDevice(device);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    refresh();
  };

  const handleEmployeeFilterChange = (value: string) => {
    setSelectedEmployeeId(value);
    const params = new URLSearchParams(currentSearchParams.toString());
    if (value) {
      params.set('userId', value);
    } else {
      params.delete('userId');
    }
    params.set('page', '1');
    replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  };

  const handleClearAll = () => {
    setSearchText('');
    setSelectedEmployeeId('');
    replace(pathname);
  };

  const hasActiveFilters = searchText.trim().length > 0 || (searchParams.search?.trim().length ?? 0) > 0 || selectedEmployeeId.length > 0;

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
              placeholder='Search for device'
              className='w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none'
            />
          </div>
          <select
            value={selectedEmployeeId}
            onChange={(e) => handleEmployeeFilterChange(e.target.value)}
            className='h-10 rounded-[40px] border border-input bg-white px-4 text-sm font-medium text-foreground focus:outline-none'
          >
            <option value=''>All Employees</option>
            {employees.map((e) => (
              <option key={e.id} value={String(e.id)}>
                {e.firstname} {e.lastname}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <Button variant='outline' size='sm' onClick={handleClearAll} className='shrink-0'>
              <X className='h-4 w-4' />
              Clear
            </Button>
          )}
        </div>
        <Button className='rounded-[40px]' onClick={handleAdd}>
          <Plus className='h-4 w-4' />
          Add new device
        </Button>
      </div>

      <div className='center-container flex flex-1 flex-col min-h-0'>
        <DeviceDataTableClient data={data} sort={sort} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <DeviceViewDrawer open={viewDrawerOpen} onOpenChange={setViewDrawerOpen} device={viewingDevice} />

      <DeviceUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} device={editingDevice} onSuccess={handleDrawerSuccess} />

      <DeviceDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} device={deletingDevice} onSuccess={handleDeleteSuccess} />
    </div>
  );
};
