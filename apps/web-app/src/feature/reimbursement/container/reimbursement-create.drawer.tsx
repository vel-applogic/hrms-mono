'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { UpsertMediaType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { UnifiedUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createReimbursement } from '@/lib/action/reimbursement.actions';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  date: z.string().min(1, 'Date is required'),
});
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const FORM_ID = 'reimbursement-create-form';

export function ReimbursementCreateDrawer({ open, onOpenChange, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [medias, setMedias] = useState<UpsertMediaType[]>([]);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { title: '', amount: 0, date: '' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: '', amount: 0, date: '' });
      setMedias([]);
      setError('');
    }
  }, [open, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      await createReimbursement({
        title: data.title,
        amount: data.amount,
        date: data.date,
        files: medias.length > 0 ? medias : undefined,
      });
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
      title='New reimbursement request'
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit request'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}

        <div className='flex flex-col gap-2'>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' placeholder='What is this reimbursement for?' {...form.register('title')} />
          {form.formState.errors.title && <p className='text-sm text-destructive'>{form.formState.errors.title.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='amount'>Amount</Label>
          <Input
            id='amount'
            type='number'
            step='0.01'
            placeholder='0.00'
            {...form.register('amount', { valueAsNumber: true })}
          />
          {form.formState.errors.amount && <p className='text-sm text-destructive'>{form.formState.errors.amount.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='date'>Date</Label>
          <Input id='date' type='date' {...form.register('date')} />
          {form.formState.errors.date && <p className='text-sm text-destructive'>{form.formState.errors.date.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Attachments (receipts, documents, pictures)</Label>
          <UnifiedUpload
            isMultiple
            media={medias}
            onUploaded={(val) => setMedias((prev) => [...prev, val])}
            onRemove={(index) => setMedias((prev) => prev.filter((_, i) => i !== index))}
            onError={(err) => { if (err) setError(err); }}
            previewFirst
          />
        </div>
      </form>
    </Drawer>
  );
}
