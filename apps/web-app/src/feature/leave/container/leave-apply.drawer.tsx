'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LeaveCreateRequestSchema, LeaveResponseType, LeaveTypeDtoEnum } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createLeave, updateLeave } from '@/lib/action/leave.actions';

import { EmployeeSelect } from './employee-select';

const CreateFormSchema = LeaveCreateRequestSchema;
type CreateFormType = z.infer<typeof CreateFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: LeaveResponseType | null;
  employeeId?: number;
  onSuccess: () => void;
}

const FORM_ID = 'leave-apply-form';

export function LeaveApplyDrawer({ open, onOpenChange, leave, employeeId, onSuccess }: Props) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const isAdmin = session?.user?.roles?.includes('admin') ?? false;
  const isEditing = !!leave;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<CreateFormType>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: {
      userId: 0,
      leaveType: LeaveTypeDtoEnum.casual,
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (leave) {
        form.reset({
          userId: leave.userId,
          leaveType: leave.leaveType as LeaveTypeDtoEnum,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
        });
      } else {
        form.reset({
          userId: employeeId ?? currentUserId ?? 0,
          leaveType: LeaveTypeDtoEnum.casual,
          startDate: '',
          endDate: '',
          reason: '',
        });
      }
      setError('');
    }
  }, [open, leave, currentUserId, form]);

  const handleSubmit = async (data: CreateFormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && leave) {
        await updateLeave(leave.id, {
          userId: data.userId,
          leaveType: data.leaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
        });
      } else {
        await createLeave({
          userId: data.userId,
          leaveType: data.leaveType,
          startDate: data.startDate,
          endDate: data.endDate,
          reason: data.reason,
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
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit leave' : 'Apply leave'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Apply leave'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}

        <EmployeeSelect
          value={form.watch('userId') && form.watch('userId') > 0 ? form.watch('userId') : undefined}
          onChange={(userId) => form.setValue('userId', userId)}
          disabled={isEditing || !!employeeId}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
        {form.formState.errors.userId && <p className='text-sm text-destructive'>{form.formState.errors.userId.message}</p>}

        <div className='flex flex-col gap-2'>
          <Label>Leave type</Label>
          <Select value={form.watch('leaveType')} onValueChange={(val) => form.setValue('leaveType', val as LeaveTypeDtoEnum)}>
            <SelectTrigger>
              <SelectValue placeholder='Select leave type' />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LeaveTypeDtoEnum).map((t) => (
                <SelectItem key={t} value={t}>
                  {t.replace(/([A-Z])/g, ' $1').trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='startDate'>Start date</Label>
            <Input id='startDate' type='date' {...form.register('startDate')} />
            {form.formState.errors.startDate && <p className='text-sm text-destructive'>{form.formState.errors.startDate.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='endDate'>End date</Label>
            <Input id='endDate' type='date' {...form.register('endDate')} />
            {form.formState.errors.endDate && <p className='text-sm text-destructive'>{form.formState.errors.endDate.message}</p>}
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='reason'>Reason</Label>
          <Input id='reason' placeholder='Reason for leave' {...form.register('reason')} />
          {form.formState.errors.reason && <p className='text-sm text-destructive'>{form.formState.errors.reason.message}</p>}
        </div>
      </form>
    </Drawer>
  );
}
