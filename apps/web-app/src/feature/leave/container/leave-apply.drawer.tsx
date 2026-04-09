'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LeaveCreateRequestSchema, LeaveDayHalfDtoEnum, LeaveResponseType, LeaveTypeDtoEnum } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { cn } from '@repo/ui/lib/utils';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
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

type HalfOption = { value: LeaveDayHalfDtoEnum; label: string };

const ALL_HALF_OPTIONS: HalfOption[] = [
  { value: LeaveDayHalfDtoEnum.full, label: 'Full day' },
  { value: LeaveDayHalfDtoEnum.firstHalf, label: 'First half' },
  { value: LeaveDayHalfDtoEnum.secondHalf, label: 'Second half' },
];

function getCalendarDays(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
}

function calculateDays(startDate: string, endDate: string, startDuration: LeaveDayHalfDtoEnum, endDuration: LeaveDayHalfDtoEnum): number {
  if (!startDate || !endDate) return 0;
  const isSameDay = startDate === endDate;
  if (isSameDay) {
    if (startDuration === LeaveDayHalfDtoEnum.full) return 1;
    return 0.5;
  }
  let days = getCalendarDays(startDate, endDate);
  if (startDuration === LeaveDayHalfDtoEnum.secondHalf) days -= 0.5;
  if (endDuration === LeaveDayHalfDtoEnum.firstHalf) days -= 0.5;
  return Math.max(0, days);
}

function HalfDayToggle({
  value,
  options,
  onChange,
  disabled,
}: {
  value: LeaveDayHalfDtoEnum;
  options: HalfOption[];
  onChange: (val: LeaveDayHalfDtoEnum) => void;
  disabled?: boolean;
}) {
  return (
    <div className='inline-flex rounded-lg border border-border bg-card p-1'>
      {options.map((opt) => (
        <button
          key={opt.value}
          type='button'
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            value === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

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
      startDuration: LeaveDayHalfDtoEnum.full,
      endDuration: LeaveDayHalfDtoEnum.full,
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
          startDuration: leave.startDuration ?? LeaveDayHalfDtoEnum.full,
          endDuration: leave.endDuration ?? LeaveDayHalfDtoEnum.full,
          reason: leave.reason,
        });
      } else {
        form.reset({
          userId: employeeId ?? currentUserId ?? 0,
          leaveType: LeaveTypeDtoEnum.casual,
          startDate: '',
          endDate: '',
          startDuration: LeaveDayHalfDtoEnum.full,
          endDuration: LeaveDayHalfDtoEnum.full,
          reason: '',
        });
      }
      setError('');
    }
  }, [open, leave, currentUserId, form]);

  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const startDuration = form.watch('startDuration') ?? LeaveDayHalfDtoEnum.full;
  const endDuration = form.watch('endDuration') ?? LeaveDayHalfDtoEnum.full;

  // Force end date to equal start date when start is firstHalf
  useEffect(() => {
    if (startDuration === LeaveDayHalfDtoEnum.firstHalf && startDate && endDate !== startDate) {
      form.setValue('endDate', startDate);
    }
  }, [startDuration, startDate, endDate, form]);

  // Reset endDuration to full when conditions change
  useEffect(() => {
    const isSameDay = startDate && startDate === endDate;
    if (isSameDay) {
      // For same day, endDuration must mirror startDuration
      if (endDuration !== startDuration) {
        form.setValue('endDuration', startDuration);
      }
    } else {
      // Different days: endDuration can only be full or firstHalf
      if (endDuration === LeaveDayHalfDtoEnum.secondHalf) {
        form.setValue('endDuration', LeaveDayHalfDtoEnum.full);
      }
    }
  }, [startDate, endDate, startDuration, endDuration, form]);

  const isSameDay = !!startDate && startDate === endDate;
  const isStartFirstHalf = startDuration === LeaveDayHalfDtoEnum.firstHalf;
  const isEndDurationEnabled = !isSameDay && startDuration !== LeaveDayHalfDtoEnum.firstHalf;
  const numberOfDays = useMemo(() => calculateDays(startDate, endDate, startDuration, endDuration), [startDate, endDate, startDuration, endDuration]);

  const startDurationOptions: HalfOption[] = ALL_HALF_OPTIONS;
  const endDurationOptions: HalfOption[] = [
    { value: LeaveDayHalfDtoEnum.full, label: 'Full day' },
    { value: LeaveDayHalfDtoEnum.firstHalf, label: 'First half' },
  ];

  const handleSubmit = async (data: CreateFormType) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        userId: data.userId,
        leaveType: data.leaveType,
        startDate: data.startDate,
        endDate: data.endDate,
        startDuration: data.startDuration,
        endDuration: data.endDuration,
        reason: data.reason,
      };
      if (isEditing && leave) {
        await updateLeave(leave.id, payload);
      } else {
        await createLeave(payload);
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

        {isAdmin && (
          <>
            <EmployeeSelect
              value={form.watch('userId') && form.watch('userId') > 0 ? form.watch('userId') : undefined}
              onChange={(userId) => form.setValue('userId', userId)}
              disabled={isEditing || !!employeeId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
            />
            {form.formState.errors.userId && <p className='text-sm text-destructive'>{form.formState.errors.userId.message}</p>}
          </>
        )}

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

        <div className='flex flex-col gap-3'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='startDate'>Start date</Label>
              <Input id='startDate' type='date' {...form.register('startDate')} />
              {form.formState.errors.startDate && <p className='text-sm text-destructive'>{form.formState.errors.startDate.message}</p>}
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='endDate'>End date</Label>
              <Input id='endDate' type='date' disabled={isStartFirstHalf} {...form.register('endDate')} />
              {form.formState.errors.endDate && <p className='text-sm text-destructive'>{form.formState.errors.endDate.message}</p>}
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label className='text-xs text-muted-foreground'>Start day</Label>
              <HalfDayToggle
                value={startDuration}
                options={startDurationOptions}
                onChange={(val) => form.setValue('startDuration', val, { shouldValidate: true })}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label className='text-xs text-muted-foreground'>End day</Label>
              <HalfDayToggle
                value={endDuration}
                options={endDurationOptions}
                onChange={(val) => form.setValue('endDuration', val, { shouldValidate: true })}
                disabled={!isEndDurationEnabled}
              />
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>
            Number of days: <span className='font-medium text-foreground'>{numberOfDays}</span>
          </p>
          {form.formState.errors.endDuration && <p className='text-sm text-destructive'>{form.formState.errors.endDuration.message}</p>}
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
