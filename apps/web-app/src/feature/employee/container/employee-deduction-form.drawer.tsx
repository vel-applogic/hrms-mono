'use client';

import type { EmployeeDeductionResponseType } from '@repo/dto';
import {
  UserEmployeeDeductionFrequencyDtoEnum,
  UserEmployeeDeductionTypeDtoEnum,
} from '@repo/dto';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { MonthYearPicker } from '@repo/ui/component/shadcn/month-year-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/component/shadcn/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';

import { createEmployeeDeduction, updateEmployeeDeduction } from '@/lib/action/employee-deduction.actions';

const DEDUCTION_TYPE_LABELS: Record<UserEmployeeDeductionTypeDtoEnum, string> = {
  providentFund: 'Provident Fund',
  incomeTax: 'Income Tax',
  insurance: 'Insurance',
  professionalTax: 'Professional Tax',
  loan: 'Loan',
  other: 'Other',
};

const DEDUCTION_FREQUENCY_LABELS: Record<UserEmployeeDeductionFrequencyDtoEnum, string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  specificMonth: 'Specific Month',
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  deduction?: EmployeeDeductionResponseType;
  onSuccess: (deduction: EmployeeDeductionResponseType) => void;
}

type FieldErrors = {
  type?: string;
  otherTitle?: string;
  frequency?: string;
  specificMonth?: string;
  amount?: string;
  effectiveFrom?: string;
  effectiveTill?: string;
};

export function EmployeeDeductionFormDrawer({ open, onOpenChange, employeeId, deduction, onSuccess }: Props) {
  const isEditing = !!deduction;
  const [type, setType] = useState<UserEmployeeDeductionTypeDtoEnum>(deduction?.type ?? 'providentFund');
  const [frequency, setFrequency] = useState<UserEmployeeDeductionFrequencyDtoEnum>(deduction?.frequency ?? 'monthly');
  const [amount, setAmount] = useState(deduction?.amount?.toString() ?? '');
  const [otherTitle, setOtherTitle] = useState(deduction?.otherTitle ?? '');
  const [specificMonth, setSpecificMonth] = useState(deduction?.specificMonth ?? '');
  const [effectiveFrom, setEffectiveFrom] = useState(deduction?.effectiveFrom ?? '');
  const [effectiveTill, setEffectiveTill] = useState(deduction?.effectiveTill ?? '');
  const [isActive, setIsActive] = useState(deduction?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setType(deduction?.type ?? 'providentFund');
      setFrequency(deduction?.frequency ?? 'monthly');
      setAmount(deduction?.amount?.toString() ?? '');
      setOtherTitle(deduction?.otherTitle ?? '');
      setSpecificMonth(deduction?.specificMonth ?? '');
      setEffectiveFrom(deduction?.effectiveFrom ?? '');
      setEffectiveTill(deduction?.effectiveTill ?? '');
      setIsActive(deduction?.isActive ?? true);
      setError('');
      setFieldErrors({});
    }
  }, [open, deduction]);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    const amountNum = parseFloat(amount);
    if (!amount.trim()) {
      errors.amount = 'Amount is required';
    } else if (isNaN(amountNum) || amountNum < 0) {
      errors.amount = 'Amount must be a valid positive number';
    }
    if (!isEditing && !effectiveFrom) {
      errors.effectiveFrom = 'Effective from is required';
    }
    if (type === 'other' && !otherTitle.trim()) {
      errors.otherTitle = 'Title is required when type is Other';
    }
    if (frequency === 'specificMonth') {
      if (!specificMonth.trim()) {
        errors.specificMonth = 'Specific month date is required when frequency is Specific Month';
      } else if (fieldErrors.specificMonth) {
        errors.specificMonth = fieldErrors.specificMonth;
      }
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('');
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setError('');
    try {
      const basePayload = {
        type,
        frequency,
        amount: amountNum,
        effectiveFrom: effectiveFrom || undefined,
        effectiveTill: effectiveTill || undefined,
      };
      const payloadWithConditionals = {
        ...basePayload,
        otherTitle: type === 'other' ? otherTitle : undefined,
        ...(frequency === 'specificMonth' ? { specificMonth: specificMonth } : {}),
      };

      if (isEditing && deduction) {
        const result = await updateEmployeeDeduction(deduction.id, {
          ...payloadWithConditionals,
          isActive,
        });
        onSuccess(result);
      } else {
        const result = await createEmployeeDeduction({
          employeeId,
          ...payloadWithConditionals,
          effectiveFrom,
          isActive,
        });
        onSuccess(result);
      }
      setAmount('');
      setEffectiveFrom('');
      setEffectiveTill('');
      setOtherTitle('');
      setSpecificMonth('');
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      if (message.toLowerCase().includes('effective')) {
        setFieldErrors({ effectiveFrom: message });
        setError('');
      } else {
        setFieldErrors({});
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setType(deduction?.type ?? 'providentFund');
      setFrequency(deduction?.frequency ?? 'monthly');
      setAmount(deduction?.amount?.toString() ?? '');
      setOtherTitle(deduction?.otherTitle ?? '');
      setSpecificMonth(deduction?.specificMonth ?? '');
      setEffectiveFrom(deduction?.effectiveFrom ?? '');
      setEffectiveTill(deduction?.effectiveTill ?? '');
      setIsActive(deduction?.isActive ?? true);
      setError('');
      setFieldErrors({});
    }
    onOpenChange(next);
  };

  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      title={isEditing ? 'Edit deduction' : 'Add deduction'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button type='button' onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save' : 'Add'}
          </Button>
        </div>
      }
    >
      <div className='flex flex-col gap-6 p-6'>
        {hasFieldErrors && (
          <p className='rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            Please check the below errors to proceed
          </p>
        )}
        {error && !hasFieldErrors && <p className='text-sm text-destructive'>{error}</p>}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='type'>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as UserEmployeeDeductionTypeDtoEnum)}>
              <SelectTrigger id='type' className={cn(fieldErrors.type && 'border-destructive')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DEDUCTION_TYPE_LABELS) as UserEmployeeDeductionTypeDtoEnum[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {DEDUCTION_TYPE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.type && <p className='text-sm text-destructive'>{fieldErrors.type}</p>}
          </div>
          {type === 'other' && (
            <div className='flex flex-col gap-2'>
              <Label htmlFor='otherTitle'>Title</Label>
              <Input
                id='otherTitle'
                value={otherTitle}
                onChange={(e) => {
                  setOtherTitle(e.target.value);
                  if (fieldErrors.otherTitle) setFieldErrors((prev) => ({ ...prev, otherTitle: undefined }));
                }}
                placeholder='Enter deduction title'
                className={cn(fieldErrors.otherTitle && 'border-destructive')}
              />
              {fieldErrors.otherTitle && <p className='text-sm text-destructive'>{fieldErrors.otherTitle}</p>}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='frequency'>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) => {
                const newFreq = v as UserEmployeeDeductionFrequencyDtoEnum;
                setFrequency(newFreq);
                if (newFreq !== 'specificMonth') setSpecificMonth('');
                if (fieldErrors.specificMonth) setFieldErrors((prev) => ({ ...prev, specificMonth: undefined }));
              }}
            >
              <SelectTrigger id='frequency' className={cn(fieldErrors.frequency && 'border-destructive')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(DEDUCTION_FREQUENCY_LABELS) as UserEmployeeDeductionFrequencyDtoEnum[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {DEDUCTION_FREQUENCY_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldErrors.frequency && <p className='text-sm text-destructive'>{fieldErrors.frequency}</p>}
          </div>
          {frequency === 'specificMonth' && (
            <div className='flex flex-col gap-2'>
              <Label htmlFor='specificMonth'>Specific month</Label>
              <MonthYearPicker
                value={specificMonth}
                onChange={(v) => {
                  setSpecificMonth(v);
                  if (fieldErrors.specificMonth) setFieldErrors((prev) => ({ ...prev, specificMonth: undefined }));
                }}
                onError={(err) =>
                  setFieldErrors((prev) => (err ? { ...prev, specificMonth: err } : { ...prev, specificMonth: undefined }))
                }
              />
              {fieldErrors.specificMonth && <p className='text-sm text-destructive'>{fieldErrors.specificMonth}</p>}
            </div>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={isActive ? 'active' : 'inactive'}
              onValueChange={(v) => setIsActive(v === 'active')}
            >
              <SelectTrigger id='status'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='inactive'>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='amount'>Amount (₹)</Label>
            <Input
              id='amount'
              type='number'
              min={0}
              step={1}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (fieldErrors.amount) setFieldErrors((prev) => ({ ...prev, amount: undefined }));
              }}
              placeholder='0'
              className={cn(fieldErrors.amount && 'border-destructive')}
            />
            {fieldErrors.amount && <p className='text-sm text-destructive'>{fieldErrors.amount}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='effectiveFrom'>Effective from</Label>
            <Input
              id='effectiveFrom'
              type='date'
              value={effectiveFrom}
              onChange={(e) => {
                setEffectiveFrom(e.target.value);
                if (fieldErrors.effectiveFrom) setFieldErrors((prev) => ({ ...prev, effectiveFrom: undefined }));
              }}
              className={cn(!effectiveFrom && 'text-muted-foreground', fieldErrors.effectiveFrom && 'border-destructive')}
            />
            {fieldErrors.effectiveFrom && <p className='text-sm text-destructive'>{fieldErrors.effectiveFrom}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='effectiveTill'>Effective till</Label>
            <Input
              id='effectiveTill'
              type='date'
              value={effectiveTill}
              onChange={(e) => {
                setEffectiveTill(e.target.value);
                if (fieldErrors.effectiveTill) setFieldErrors((prev) => ({ ...prev, effectiveTill: undefined }));
              }}
              className={cn(!effectiveTill && 'text-muted-foreground', fieldErrors.effectiveTill && 'border-destructive')}
            />
            {fieldErrors.effectiveTill && <p className='text-sm text-destructive'>{fieldErrors.effectiveTill}</p>}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
