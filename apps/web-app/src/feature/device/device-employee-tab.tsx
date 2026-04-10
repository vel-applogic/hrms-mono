'use client';

import { EmployeeDeviceResponseType } from '@repo/dto';
import { Label } from '@repo/ui/component/ui/label';
import { deviceStatusDtoEnumToReadableLabel, deviceTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Laptop, Monitor, Smartphone, Tablet, Keyboard, Mouse, Headphones, HardDrive } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { getEmployeeDevices } from '@/lib/action/device.actions';

function getDeviceIcon(type: EmployeeDeviceResponseType['type']) {
  switch (type) {
    case 'mobile':
      return Smartphone;
    case 'tablet':
      return Tablet;
    case 'laptop':
      return Laptop;
    case 'cpu':
      return HardDrive;
    case 'keyboard':
      return Keyboard;
    case 'mouse':
      return Mouse;
    case 'headphone':
      return Headphones;
    default:
      return Monitor;
  }
}

interface Props {
  employeeId: number;
}

export function DeviceEmployeeTab({ employeeId }: Props) {
  const [devices, setDevices] = useState<EmployeeDeviceResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployeeDevices(employeeId);
      setDevices(data);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    void fetchDevices();
  }, [fetchDevices]);

  if (loading) {
    return <p className='text-sm text-muted-foreground'>Loading devices...</p>;
  }

  if (devices.length === 0) {
    return <p className='text-sm text-muted-foreground'>No devices assigned to this employee</p>;
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {devices.map((device) => {
        const Icon = getDeviceIcon(device.type);
        return (
          <div key={device.id} className='flex gap-4 rounded-lg border border-border bg-card p-4'>
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
              <Icon className='h-7 w-7 text-primary' />
            </div>

            <div className='min-w-0 flex-1'>
              <p className='font-semibold text-foreground'>{device.brand} {device.model}</p>
              <p className='text-xs text-muted-foreground'>{deviceTypeDtoEnumToReadableLabel(device.type)}</p>
              {device.config && <p className='mt-1 text-xs text-muted-foreground'>{device.config}</p>}

              <div className='mt-2 grid gap-1.5'>
                <div className='flex justify-between'>
                  <Label className='text-xs text-muted-foreground'>Serial Number</Label>
                  <p className='text-xs'>{device.serialNumber}</p>
                </div>
                <div className='flex justify-between'>
                  <Label className='text-xs text-muted-foreground'>Status</Label>
                  <p className='text-xs'>{deviceStatusDtoEnumToReadableLabel(device.status)}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
