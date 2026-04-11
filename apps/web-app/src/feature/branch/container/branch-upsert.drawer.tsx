'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BranchResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createBranch, updateBranch } from '@/lib/action/branch.actions';

const FormSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
});
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: BranchResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'branch-upsert-form';

export function BranchUpsertDrawer({ open, onOpenChange, branch, onSuccess }: Props) {
  const isEditing = !!branch;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ name: branch?.name ?? '' });
      setError('');
    }
  }, [open, branch, form]);

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
      const result = isEditing && branch
        ? await updateBranch(branch.id, { id: branch.id, name: data.name })
        : await createBranch({ name: data.name });

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
      title={isEditing ? 'Edit branch' : 'New branch'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create branch'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='name'>Branch name</Label>
          <Input id='name' placeholder='e.g. Head Office' {...form.register('name')} />
          {form.formState.errors.name && <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
