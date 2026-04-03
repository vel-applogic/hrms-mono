'use client';

import type { EmployeeDeductionResponseType } from '@repo/dto';
import {
  PayrollDeductionFrequencyDtoEnum,
  PayrollDeductionTypeDtoEnum,
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
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createEmployeeDeduction, updateEmployeeDeduction } from '@/lib/action/employee-deduction.actions';

const DEDUCTION_TYPE_LABELS: Record<PayrollDeductionTypeDtoEnum, string> = {
  providentFund: 'Provident Fund',
  incomeTax: 'Income Tax',
  insurance: 'Insurance',
  professionalTax: 'Professional Tax',
  loan: 'Loan',
  lop: 'LOP',
  other: 'Other',
};

const DEDUCTION_FREQUENCY_LABELS: Record<PayrollDeductionFrequencyDtoEnum, string> = {
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

type LineItemForm = {
  type: PayrollDeductionTypeDtoEnum;
  frequency: PayrollDeductionFrequencyDtoEnum;
  amount: string;
  otherTitle: string;
  specificMonth: string;
};

type FieldErrors = {
  effectiveFrom?: string;
  effectiveTill?: string;
  lineItems?: string;
};

export function EmployeeDeductionFormDrawer({ open, onOpenChange, employeeId, deduction, onSuccess }: Props) {
  const isEditing = !!deduction;

  const defaultLineItems = (): LineItemForm[] =>
    deduction?.lineItems?.length
      ? deduction.lineItems.map((li) => ({
          type: li.type as PayrollDeductionTypeDtoEnum,
          frequency: li.frequency as PayrollDeductionFrequencyDtoEnum,
          amount: String(li.amount),
          otherTitle: li.otherTitle ?? '',
          specificMonth: li.specificMonth ?? '',
        }))
      : [{ type: 'providentFund', frequency: 'monthly', amount: '', otherTitle: '', specificMonth: '' }];

  const [lineItems, setLineItems] = useState<LineItemForm[]>(defaultLineItems);
  const [effectiveFrom, setEffectiveFrom] = useState(deduction?.effectiveFrom ?? '');
  const [effectiveTill, setEffectiveTill] = useState(deduction?.effectiveTill ?? '');
  const [isActive, setIsActive] = useState(deduction?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setLineItems(defaultLineItems());
      setEffectiveFrom(deduction?.effectiveFrom ?? '');
      setEffectiveTill(deduction?.effectiveTill ?? '');
      setIsActive(deduction?.isActive ?? true);
      setError('');
      setFieldErrors({});
    }
  }, [open, deduction]);

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'frequency' && value !== 'specificMonth') {
          updated.specificMonth = '';
        }
        return updated;
      }),
    );
    if (fieldErrors.lineItems) setFieldErrors((prev) => ({ ...prev, lineItems: undefined }));
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { type: 'providentFund', frequency: 'monthly', amount: '', otherTitle: '', specificMonth: '' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    if (!isEditing && !effectiveFrom) {
      errors.effectiveFrom = 'Effective from is required';
    }

    for (const li of lineItems) {
      if (!li.amount.trim() || isNaN(parseFloat(li.amount)) || parseFloat(li.amount) < 0) {
        errors.lineItems = 'All line items must have a valid positive amount';
        break;
      }
      if (li.type === 'other' && !li.otherTitle.trim()) {
        errors.lineItems = 'Title is required when type is Other';
        break;
      }
      if (li.frequency === 'specificMonth' && !li.specificMonth.trim()) {
        errors.lineItems = 'Specific month is required when frequency is Specific Month';
        break;
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

    const parsedLineItems = lineItems.map((li) => ({
      type: li.type,
      frequency: li.frequency,
      amount: parseFloat(li.amount),
      otherTitle: li.type === 'other' ? li.otherTitle : undefined,
      specificMonth: li.frequency === 'specificMonth' ? li.specificMonth : undefined,
    }));

    try {
      if (isEditing && deduction) {
        const result = await updateEmployeeDeduction(deduction.id, {
          effectiveFrom: effectiveFrom || undefined,
          effectiveTill: effectiveTill || undefined,
          isActive,
          lineItems: parsedLineItems,
        });
        onSuccess(result);
      } else {
        const result = await createEmployeeDeduction({
          employeeId,
          effectiveFrom,
          effectiveTill: effectiveTill || undefined,
          isActive,
          lineItems: parsedLineItems,
        });
        onSuccess(result);
      }
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
      setLineItems(defaultLineItems());
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

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
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

        <hr className='border-border' />

        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <Label>Line items</Label>
            <Button type='button' variant='outline' size='sm' onClick={addLineItem}>
              <Plus className='mr-1 h-3.5 w-3.5' />
              Add item
            </Button>
          </div>
          {fieldErrors.lineItems && <p className='text-sm text-destructive'>{fieldErrors.lineItems}</p>}

          {lineItems.map((item, index) => (
            <div key={index} className='rounded-md border border-border p-3'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='text-xs font-medium text-muted-foreground'>Item {index + 1}</span>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 text-destructive hover:text-destructive'
                  onClick={() => removeLineItem(index)}
                  disabled={lineItems.length <= 1}
                >
                  <Trash2 className='h-3 w-3' />
                </Button>
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div className='flex flex-col gap-1'>
                  <Label className='text-xs'>Type</Label>
                  <Select
                    value={item.type}
                    onValueChange={(v) => updateLineItem(index, 'type', v)}
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DEDUCTION_TYPE_LABELS) as PayrollDeductionTypeDtoEnum[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {DEDUCTION_TYPE_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex flex-col gap-1'>
                  <Label className='text-xs'>Frequency</Label>
                  <Select
                    value={item.frequency}
                    onValueChange={(v) => updateLineItem(index, 'frequency', v)}
                  >
                    <SelectTrigger className='h-9'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(DEDUCTION_FREQUENCY_LABELS) as PayrollDeductionFrequencyDtoEnum[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {DEDUCTION_FREQUENCY_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className='flex flex-col gap-1'>
                  <Label className='text-xs'>Amount (₹)</Label>
                  <Input
                    type='number'
                    min={0}
                    step={1}
                    value={item.amount}
                    onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                    placeholder='0'
                    className='h-9'
                  />
                </div>
                {item.type === 'other' && (
                  <div className='flex flex-col gap-1'>
                    <Label className='text-xs'>Title</Label>
                    <Input
                      value={item.otherTitle}
                      onChange={(e) => updateLineItem(index, 'otherTitle', e.target.value)}
                      placeholder='Enter deduction title'
                      className='h-9'
                    />
                  </div>
                )}
                {item.frequency === 'specificMonth' && (
                  <div className='flex flex-col gap-1'>
                    <Label className='text-xs'>Specific month</Label>
                    <MonthYearPicker
                      value={item.specificMonth}
                      onChange={(v) => updateLineItem(index, 'specificMonth', v)}
                      onError={() => {}}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <hr className='border-border' />

        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium text-muted-foreground'>Total deduction</p>
          <p className='text-lg font-semibold'>
            ₹{lineItems.reduce((sum, li) => sum + (parseFloat(li.amount) || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </Drawer>
  );
}
