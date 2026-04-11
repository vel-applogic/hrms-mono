'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { DepartmentResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createDepartment, updateDepartment } from '@/lib/action/department.actions';

const FormSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
});
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: DepartmentResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'department-upsert-form';

export function DepartmentUpsertDrawer({ open, onOpenChange, department, onSuccess }: Props) {
  const isEditing = !!department;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: department?.name ?? '' });
      setError('');
    }
  }, [open, department, form]);

  const applyActionError = (error: { message: string; fieldErrors?: { field: string; message: string }[] }) => {
    if (error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) => {
        form.setError(field as keyof FormType, { type: 'server', message });
      });
    } else {
      setError(error.message);
    }
  };

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      const result = isEditing && department
        ? await updateDepartment(department.id, { id: department.id, name: data.name })
        : await createDepartment({ name: data.name });

      if (!result.ok) {
        applyActionError(result.error);
        return;
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit department' : 'New department'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create department'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='name'>Department name</Label>
          <Input id='name' placeholder='e.g. Human Resources' {...form.register('name')} />
          {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
