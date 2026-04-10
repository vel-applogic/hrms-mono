'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DeviceDetailResponseType, DeviceStatusDtoEnum, DeviceTypeDtoEnum, MediaTypeDtoEnum } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Switch } from '@repo/ui/component/ui/switch';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { deviceStatusDtoEnumToReadableLabel, deviceTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';

import { FileUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createDevice, updateDevice } from '@/lib/action/device.actions';
import { EmployeeSelect } from '@/feature/leave/container/employee-select';


const FormSchema = z.object({
  type: z.enum(DeviceTypeDtoEnum),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  purchasedAt: z.string().optional(),
  warrantyExpiresAt: z.string().min(1, 'Warranty expiration date is required'),
  inWarranty: z.boolean(),
  status: z.enum(DeviceStatusDtoEnum),
  config: z.string().optional(),
  assignedToId: z.number().optional(),
});
type FormType = z.infer<typeof FormSchema>;

type MediaWithCaption = {
  key: string;
  name: string;
  type: MediaTypeDtoEnum;
  id?: number;
  caption?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: DeviceDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'device-upsert-form';

const emptyDefaults: FormType = {
  type: DeviceTypeDtoEnum.laptop,
  brand: '',
  model: '',
  serialNumber: '',
  price: 0,
  purchasedAt: '',
  warrantyExpiresAt: '',
  inWarranty: true,
  status: DeviceStatusDtoEnum.good,
  config: '',
  assignedToId: undefined,
};

export function DeviceUpsertDrawer({ open, onOpenChange, device, onSuccess }: Props) {
  const isEditing = !!device;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState<MediaWithCaption[]>([]);
  const [assignMode, setAssignMode] = useState<'unassigned' | 'assigned'>('unassigned');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    if (device) {
      form.reset({
        type: device.type,
        brand: device.brand,
        model: device.model,
        serialNumber: device.serialNumber,
        price: device.price,
        purchasedAt: device.purchasedAt ? device.purchasedAt.split('T')[0] : '',
        warrantyExpiresAt: device.warrantyExpiresAt.split('T')[0] ?? '',
        inWarranty: device.inWarranty ?? true,
        status: device.status,
        config: device.config ?? '',
        assignedToId: device.assignedToId,
      });
      setDocuments(
        (device.medias ?? []).map((m) => ({
          key: m.key,
          name: m.name,
          type: m.type as MediaTypeDtoEnum,
          id: m.id,
          caption: m.caption,
        })),
      );
      setAssignMode(device.assignedToId ? 'assigned' : 'unassigned');
    } else {
      form.reset(emptyDefaults);
      setDocuments([]);
      setAssignMode('unassigned');
    }
    setError('');
  }, [open, device, form]);

  const handleCaptionChange = (index: number, caption: string) => {
    setDocuments((prev) => prev.map((doc, i) => (i === index ? { ...doc, caption } : doc)));
  };

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      const submitData = {
        type: data.type,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        price: data.price,
        purchasedAt: data.purchasedAt ? new Date(data.purchasedAt).toISOString() : undefined,
        warrantyExpiresAt: new Date(data.warrantyExpiresAt).toISOString(),
        inWarranty: data.inWarranty,
        status: data.status,
        config: data.config || undefined,
        assignedToId: assignMode === 'assigned' ? data.assignedToId : undefined,
        medias: documents.map((doc) => ({
          key: doc.key,
          name: doc.name,
          type: doc.type,
          id: doc.id,
          caption: doc.caption,
        })),
      };

      if (isEditing && device) {
        await updateDevice(device.id, { ...submitData, id: device.id });
      } else {
        await createDevice(submitData);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit device' : 'New device'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create device'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='type'>Type</Label>
            <Controller
              name='type'
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeviceTypeDtoEnum).map((t) => (
                      <SelectItem key={t} value={t}>
                        {deviceTypeDtoEnumToReadableLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type && <p className='text-sm text-destructive'>{form.formState.errors.type.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='status'>Status</Label>
            <Controller
              name='status'
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeviceStatusDtoEnum).map((s) => (
                      <SelectItem key={s} value={s}>
                        {deviceStatusDtoEnumToReadableLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.status && <p className='text-sm text-destructive'>{form.formState.errors.status.message}</p>}
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          <Label>Assigned To</Label>
          <div className='flex flex-col gap-2'>
            <label className='flex cursor-pointer items-center gap-2'>
              <input
                type='radio'
                name='assignMode'
                checked={assignMode === 'unassigned'}
                onChange={() => {
                  setAssignMode('unassigned');
                  form.setValue('assignedToId', undefined);
                }}
                className='h-4 w-4 accent-primary'
              />
              <span className='text-sm text-foreground'>Unassigned</span>
            </label>
            <label className='flex cursor-pointer items-center gap-2'>
              <input
                type='radio'
                name='assignMode'
                checked={assignMode === 'assigned'}
                onChange={() => setAssignMode('assigned')}
                className='h-4 w-4 accent-primary'
              />
              <span className='text-sm text-foreground'>Assign to employee</span>
            </label>
            {assignMode === 'assigned' && (
              <div className='pl-6'>
                <Controller
                  name='assignedToId'
                  control={form.control}
                  render={({ field }) => (
                    <EmployeeSelect
                      value={field.value}
                      onChange={(userId) => field.onChange(userId)}
                      placeholder='Select employee'
                      isAdmin={true}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='brand'>Brand</Label>
          <Input id='brand' placeholder='e.g. Apple, Dell, HP' {...form.register('brand')} />
          {form.formState.errors.brand && <p className='text-sm text-destructive'>{form.formState.errors.brand.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='model'>Model</Label>
          <Input id='model' placeholder='e.g. MacBook Pro 14"' {...form.register('model')} />
          {form.formState.errors.model && <p className='text-sm text-destructive'>{form.formState.errors.model.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='serialNumber'>Serial Number</Label>
          <Input id='serialNumber' placeholder='e.g. ABC123XYZ' {...form.register('serialNumber')} />
          {form.formState.errors.serialNumber && <p className='text-sm text-destructive'>{form.formState.errors.serialNumber.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='config'>Configuration</Label>
          <Input id='config' placeholder='e.g. 16GB RAM, 512GB SSD, Intel i7' {...form.register('config')} />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='price'>Price</Label>
            <Input id='price' type='number' step='0.01' {...form.register('price', { valueAsNumber: true })} />
            {form.formState.errors.price && <p className='text-sm text-destructive'>{form.formState.errors.price.message}</p>}
          </div>

          <div className='flex items-center gap-3 pt-6'>
            <Controller
              name='inWarranty'
              control={form.control}
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label>In Warranty</Label>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='purchasedAt'>Purchased Date</Label>
            <Input id='purchasedAt' type='date' {...form.register('purchasedAt')} />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='warrantyExpiresAt'>Warranty Expires</Label>
            <Input id='warrantyExpiresAt' type='date' {...form.register('warrantyExpiresAt')} />
            {form.formState.errors.warrantyExpiresAt && <p className='text-sm text-destructive'>{form.formState.errors.warrantyExpiresAt.message}</p>}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Documents</Label>
          <FileUpload
            isMultiple={true}
            media={documents}
            onUploaded={(val) => setDocuments((prev) => [...prev, { key: val.key, name: val.name, type: val.type, caption: '' }])}
            onRemove={(index) => setDocuments((prev) => prev.filter((_, i) => i !== index))}
            onError={(err) => err && setError(err)}
            previewFirst
          />
          {documents.length > 0 && (
            <div className='mt-2 flex flex-col gap-3'>
              {documents.map((doc, index) => (
                <div key={`${doc.key}-${index}`} className='flex items-center gap-2 rounded-md border border-border p-2'>
                  <p className='min-w-0 flex-1 truncate text-sm text-foreground'>{doc.name}</p>
                  <Input
                    value={doc.caption ?? ''}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    placeholder='Caption (optional)'
                    className='h-8 w-48'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 shrink-0 text-destructive hover:text-destructive'
                    onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== index))}
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}
