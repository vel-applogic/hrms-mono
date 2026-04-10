'use client';

import { DeviceDetailResponseType } from '@repo/dto';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { deviceStatusDtoEnumToReadableLabel, deviceTypeDtoEnumToReadableLabel } from '@repo/shared';
import { FileText } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: DeviceDetailResponseType | null;
}

export function DeviceViewDrawer({ open, onOpenChange, device }: Props) {
  if (!device) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title={`${device.brand} ${device.model}`}>
      <div className='flex flex-col gap-6 p-6'>
        {/* Device Details */}
        <div className='grid gap-3 sm:grid-cols-2'>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Type</Label>
            <p className='text-sm'>{deviceTypeDtoEnumToReadableLabel(device.type)}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Status</Label>
            <p className='text-sm'>{deviceStatusDtoEnumToReadableLabel(device.status)}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Brand</Label>
            <p className='text-sm'>{device.brand}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Model</Label>
            <p className='text-sm'>{device.model}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Serial Number</Label>
            <p className='text-sm'>{device.serialNumber}</p>
          </div>
          {device.config && (
            <div className='col-span-2 flex flex-col gap-1'>
              <Label className='text-muted-foreground'>Configuration</Label>
              <p className='text-sm'>{device.config}</p>
            </div>
          )}
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Price</Label>
            <p className='text-sm'>{device.price}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>In Warranty</Label>
            <p className='text-sm'>{device.inWarranty ? 'Yes' : 'No'}</p>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Warranty Expires</Label>
            <p className='text-sm'>{new Date(device.warrantyExpiresAt).toLocaleDateString()}</p>
          </div>
          {device.purchasedAt && (
            <div className='flex flex-col gap-1'>
              <Label className='text-muted-foreground'>Purchased</Label>
              <p className='text-sm'>{new Date(device.purchasedAt).toLocaleDateString()}</p>
            </div>
          )}
          <div className='flex flex-col gap-1'>
            <Label className='text-muted-foreground'>Assigned To</Label>
            <p className='text-sm'>
              {device.assignedTo ? `${device.assignedTo.firstname} ${device.assignedTo.lastname}` : 'Unassigned'}
            </p>
          </div>
        </div>

        {/* Documents */}
        {device.medias && device.medias.length > 0 && (
          <div className='flex flex-col gap-2'>
            <Label className='text-base font-medium'>Documents</Label>
            <div className='flex flex-col gap-2'>
              {device.medias.map((media) => (
                <a
                  key={media.id}
                  href={media.urlFull}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 rounded-md border border-border p-2 hover:bg-muted/50'
                >
                  <FileText className='h-4 w-4 shrink-0 text-muted-foreground' />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-foreground'>{media.name}</p>
                    {media.caption && <p className='truncate text-xs text-muted-foreground'>{media.caption}</p>}
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Possession History */}
        <div className='flex flex-col gap-2'>
          <Label className='text-base font-medium'>Possession History</Label>
          {device.possessionHistories && device.possessionHistories.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {device.possessionHistories.map((ph) => (
                <div key={ph.id} className='rounded-lg border border-border bg-card p-4 shadow-sm'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold text-foreground'>
                      {ph.firstname} {ph.lastname}
                    </p>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${ph.toDate ? 'border border-muted-foreground/30 bg-muted/50 text-muted-foreground' : 'border border-green-500/30 bg-green-500/10 text-green-400'}`}>
                      {ph.toDate ? 'Returned' : 'Current'}
                    </span>
                  </div>
                  <div className='mt-2 grid grid-cols-2 gap-2'>
                    <div className='flex flex-col gap-0.5'>
                      <Label className='text-xs text-muted-foreground'>From</Label>
                      <p className='text-sm text-foreground'>{new Date(ph.fromDate).toLocaleString()}</p>
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <Label className='text-xs text-muted-foreground'>To</Label>
                      <p className='text-sm text-foreground'>{ph.toDate ? new Date(ph.toDate).toLocaleString() : 'Present'}</p>
                    </div>
                  </div>
                  {ph.notes && ph.notes.length > 0 && (
                    <div className='mt-2 rounded-md bg-muted/30 px-3 py-2'>
                      {ph.notes.map((note, idx) => (
                        <p key={idx} className='text-xs text-muted-foreground'>
                          {note}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No possession history</p>
          )}
        </div>
      </div>
    </Drawer>
  );
}
