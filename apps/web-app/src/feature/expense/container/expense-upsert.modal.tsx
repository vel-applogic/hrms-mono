'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ExpenseResponseType } from '@repo/dto';
import { ExpenseTypeDtoEnum } from '@repo/dto';
import { expenseTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/component/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/component/shadcn/dialog';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createExpense, updateExpense } from '@/lib/action/expense.actions';

const FormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(1, 'Description is required').trim(),
  type: z.nativeEnum(ExpenseTypeDtoEnum, { message: 'Type is required' }),
  amount: z.number({ message: 'Amount is required' }).min(0, 'Amount must be non-negative'),
});
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: ExpenseResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'expense-upsert-form';

export function ExpenseUpsertModal({ open, onOpenChange, expense, onSuccess }: Props) {
  const isEditing = !!expense;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: { date: '', description: '', type: undefined, amount: 0 },
  });

  useEffect(() => {
    if (open) {
      if (expense) {
        form.reset({
          date: expense.date,
          description: expense.description,
          type: expense.type,
          amount: expense.amount,
        });
      } else {
        form.reset({ date: '', description: '', type: undefined, amount: 0 });
      }
      setError('');
    }
  }, [open, expense, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && expense) {
        await updateExpense(expense.id, {
          id: expense.id,
          date: data.date,
          description: data.description,
          type: data.type,
          amount: data.amount,
        });
      } else {
        await createExpense({
          date: data.date,
          description: data.description,
          type: data.type,
          amount: data.amount,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit expense' : 'Add expense'}</DialogTitle>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='date'>Date</Label>
            <Input id='date' type='date' {...form.register('date')} />
            {form.formState.errors.date && <p className='text-sm text-destructive'>{form.formState.errors.date.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='description'>Description</Label>
            <Input id='description' placeholder='Expense description' {...form.register('description')} />
            {form.formState.errors.description && <p className='text-sm text-destructive'>{form.formState.errors.description.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Type</Label>
            <Controller
              name='type'
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type' />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ExpenseTypeDtoEnum).map((type) => (
                      <SelectItem key={type} value={type}>
                        {expenseTypeDtoEnumToReadableLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.type && <p className='text-sm text-destructive'>{form.formState.errors.type.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='amount'>Amount</Label>
            <Input
              id='amount'
              type='number'
              step='0.01'
              min='0'
              placeholder='0'
              {...form.register('amount', { valueAsNumber: true })}
            />
            {form.formState.errors.amount && <p className='text-sm text-destructive'>{form.formState.errors.amount.message}</p>}
          </div>
        </form>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Add expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
