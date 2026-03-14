'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ThemeCreateRequestSchema, ThemeDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createTheme, updateTheme } from '@/lib/action/theme.actions';

const FormSchema = ThemeCreateRequestSchema;
type FormType = z.infer<typeof FormSchema>;

interface ThemeUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme?: ThemeDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'theme-upsert-form';

export function ThemeUpsertDrawer({ open, onOpenChange, theme, onSuccess }: ThemeUpsertDrawerProps) {
  const isEditing = !!theme;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (theme) {
        form.reset({
          title: theme.title,
          description: theme.description ?? '',
        });
      } else {
        form.reset({ title: '', description: '' });
      }
      setError('');
    }
  }, [open, theme, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && theme) {
        await updateTheme(theme.id, data);
      } else {
        await createTheme(data);
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
      title={isEditing ? 'Edit theme' : 'New theme'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create theme'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' placeholder='Enter theme title...' {...form.register('title')} />
          {form.formState.errors.title && <p className='text-sm text-destructive'>{form.formState.errors.title.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea id='description' placeholder='Enter theme description...' className='min-h-[100px] resize-none' {...form.register('description')} />
          {form.formState.errors.description && <p className='text-sm text-destructive'>{form.formState.errors.description.message}</p>}
        </div>

        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
