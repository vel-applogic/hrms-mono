'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { HolidayResponseType } from '@repo/dto';
import { HolidayTypeDtoEnum } from '@repo/dto';
import { holidayTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Button } from '@repo/ui/component/ui/button';
import { Checkbox } from '@repo/ui/component/ui/checkbox';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/component/shadcn/dialog';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createHoliday, updateHoliday } from '@/lib/action/holiday.actions';

const FormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  date: z.string().min(1, 'Date is required'),
  types: z.array(z.nativeEnum(HolidayTypeDtoEnum)).min(1, 'At least one type is required'),
});
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday: HolidayResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'holiday-upsert-form';

export function HolidayUpsertModal({ open, onOpenChange, holiday, onSuccess }: Props) {
  const isEditing = !!holiday;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '', date: '', types: [] },
  });

  useEffect(() => {
    if (open) {
      if (holiday) {
        form.reset({ name: holiday.name, date: holiday.date, types: holiday.types as HolidayTypeDtoEnum[] });
      } else {
        form.reset({ name: '', date: '', types: [] });
      }
      setError('');
    }
  }, [open, holiday, form]);

  const selectedTypes = form.watch('types');

  const handleTypeToggle = (type: HolidayTypeDtoEnum, checked: boolean) => {
    const current = form.getValues('types');
    if (checked) {
      form.setValue('types', [...current, type], { shouldValidate: true });
    } else {
      form.setValue(
        'types',
        current.filter((t) => t !== type),
        { shouldValidate: true },
      );
    }
  };

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && holiday) {
        await updateHoliday(holiday.id, { id: holiday.id, name: data.name, date: data.date, types: data.types });
      } else {
        await createHoliday({ name: data.name, date: data.date, types: data.types });
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit holiday' : 'Add holiday'}</DialogTitle>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' placeholder='Holiday name' {...form.register('name')} />
            {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='date'>Date</Label>
            <Input id='date' type='date' {...form.register('date')} />
            {form.formState.errors.date && <p className='text-sm text-destructive'>{form.formState.errors.date.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Type</Label>
            <div className='flex items-center gap-4'>
              {Object.values(HolidayTypeDtoEnum).map((type) => (
                <label key={type} className='flex items-center gap-2 text-sm'>
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={(checked) => handleTypeToggle(type, checked === true)}
                  />
                  {holidayTypeDtoEnumToReadableLabel(type)}
                </label>
              ))}
            </div>
            {form.formState.errors.types && <p className='text-sm text-destructive'>{form.formState.errors.types.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Add holiday'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
