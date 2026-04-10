'use client';

import { EmployeeDeviceResponseType } from '@repo/dto';
import { deviceStatusDtoEnumToReadableLabel, deviceTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Label } from '@repo/ui/component/ui/label';
import { HardDrive, Headphones, Keyboard, Laptop, Monitor, Mouse, Smartphone, Tablet } from 'lucide-react';

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
  devices: EmployeeDeviceResponseType[];
}

export function EmployeeDeviceList({ devices }: Props) {
  if (devices.length === 0) {
    return (
      <div className='flex h-full flex-col gap-4'>
        <div className='center-container'>
          <h1 className='text-xl font-medium tracking-tight text-foreground'>My Devices</h1>
        </div>
        <div className='center-container flex flex-1 items-center justify-center'>
          <p className='text-muted-foreground'>No devices assigned to you</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {devices.map((device) => {
          const Icon = getDeviceIcon(device.type);
          return (
            <div key={device.id} className='flex gap-4 rounded-lg border border-border bg-card p-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10'>
                <Icon className='h-7 w-7 text-primary' />
              </div>

              <div className='min-w-0 flex-1'>
                <p className='font-semibold text-foreground'>
                  {device.brand} {device.model}
                </p>
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
    </div>
  );
}
