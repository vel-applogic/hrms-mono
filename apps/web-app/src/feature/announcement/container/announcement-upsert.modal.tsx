'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AnnouncementResponseType, BranchResponseType, DepartmentResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Switch } from '@repo/ui/component/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { MarkdownEditor } from '@repo/ui/component/markdown-editor';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createAnnouncement, updateAnnouncement } from '@/lib/action/announcement.actions';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  message: z.string().min(1, 'Message is required'),
  branchId: z.number().optional(),
  departmentId: z.number().optional(),
  scheduledAt: z.string().min(1, 'Scheduled date and time is required'),
  isPublished: z.boolean(),
});
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: AnnouncementResponseType | null;
  branches: BranchResponseType[];
  departments: DepartmentResponseType[];
  onSuccess: () => void;
}

const FORM_ID = 'announcement-upsert-form';

function toLocalDateTimeValue(isoString: string): string {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function AnnouncementUpsertModal({ open, onOpenChange, announcement, branches, departments, onSuccess }: Props) {
  const isEditing = !!announcement;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: '', message: '', isPublished: false, scheduledAt: '' },
  });

  useEffect(() => {
    if (open) {
      if (announcement) {
        form.reset({
          title: announcement.title,
          message: announcement.message,
          branchId: announcement.branchId ?? undefined,
          departmentId: announcement.departmentId ?? undefined,
          scheduledAt: toLocalDateTimeValue(announcement.scheduledAt),
          isPublished: announcement.isPublished,
        });
      } else {
        form.reset({ title: '', message: '', isPublished: false, scheduledAt: '' });
      }
      setError('');
    }
  }, [open, announcement, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      const scheduledAt = new Date(data.scheduledAt).toISOString();
      if (isEditing && announcement) {
        await updateAnnouncement(announcement.id, {
          id: announcement.id,
          title: data.title,
          message: data.message,
          branchId: data.branchId,
          departmentId: data.departmentId,
          scheduledAt,
          isPublished: data.isPublished,
        });
      } else {
        await createAnnouncement({
          title: data.title,
          message: data.message,
          branchId: data.branchId,
          departmentId: data.departmentId,
          scheduledAt,
          isPublished: data.isPublished,
        });
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
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit announcement' : 'Create announcement'}</DialogTitle>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' placeholder='Announcement title' {...form.register('title')} />
            {form.formState.errors.title && <p className='text-sm text-destructive'>{form.formState.errors.title.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Message</Label>
            <Controller
              name='message'
              control={form.control}
              render={({ field }) => <MarkdownEditor value={field.value} onChange={field.onChange} placeholder='Write announcement message...' className='min-h-[200px] w-full' />}
            />
            {form.formState.errors.message && <p className='text-sm text-destructive'>{form.formState.errors.message.message}</p>}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Branch</Label>
              <Select
                value={form.watch('branchId') ? String(form.watch('branchId')) : 'all'}
                onValueChange={(val) => form.setValue('branchId', val === 'all' ? undefined : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All branches' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All branches</SelectItem>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Department</Label>
              <Select
                value={form.watch('departmentId') ? String(form.watch('departmentId')) : 'all'}
                onValueChange={(val) => form.setValue('departmentId', val === 'all' ? undefined : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All departments' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All departments</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='scheduledAt'>Scheduled Date & Time</Label>
            <Input id='scheduledAt' type='datetime-local' {...form.register('scheduledAt')} />
            {form.formState.errors.scheduledAt && <p className='text-sm text-destructive'>{form.formState.errors.scheduledAt.message}</p>}
          </div>

          <div className='flex items-center gap-3'>
            <Controller
              name='isPublished'
              control={form.control}
              render={({ field }) => <Switch id='isPublished' checked={field.value} onCheckedChange={field.onChange} />}
            />
            <Label htmlFor='isPublished'>Published</Label>
          </div>
        </form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create announcement'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
