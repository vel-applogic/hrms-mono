'use client';

import type { EmployeeCompensationResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { cn } from '@repo/ui/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { createEmployeeCompensation, updateEmployeeCompensation } from '@/lib/action/employee-compensation.actions';

function formatAmount(value: number) {
  return `₹${value.toLocaleString()}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  compensation?: EmployeeCompensationResponseType;
  onSuccess: (compensation: EmployeeCompensationResponseType) => void;
}

type LineItemForm = { title: string; amount: string };

type FieldErrors = {
  effectiveFrom?: string;
  effectiveTill?: string;
  lineItems?: string;
};

export function EmployeeCompensationFormDrawer({ open, onOpenChange, employeeId, compensation, onSuccess }: Props) {
  const isEditing = !!compensation;

  const defaultLineItems = (): LineItemForm[] =>
    compensation?.lineItems?.length
      ? compensation.lineItems.map((li) => ({ title: li.title, amount: String(li.amount) }))
      : [
          { title: 'Basic', amount: '' },
          { title: 'HRA', amount: '' },
          { title: 'Other Allowances', amount: '' },
        ];

  const [lineItems, setLineItems] = useState<LineItemForm[]>(defaultLineItems);
  const [effectiveFrom, setEffectiveFrom] = useState(compensation?.effectiveFrom ?? '');
  const [effectiveTill, setEffectiveTill] = useState(compensation?.effectiveTill ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setLineItems(defaultLineItems());
      setEffectiveFrom(compensation?.effectiveFrom ?? '');
      setEffectiveTill(compensation?.effectiveTill ?? '');
      setError('');
      setFieldErrors({});
    }
  }, [open, compensation]);

  const grossAmount = useMemo(() => {
    return lineItems.reduce((sum, li) => {
      const num = parseFloat(li.amount);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [lineItems]);

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string) => {
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
    if (fieldErrors.lineItems) setFieldErrors((prev) => ({ ...prev, lineItems: undefined }));
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { title: '', amount: '' }]);
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

    const validLineItems = lineItems.filter((li) => li.title.trim() || li.amount.trim());
    if (validLineItems.length === 0) {
      errors.lineItems = 'At least one line item is required';
    }
    for (const li of validLineItems) {
      if (!li.title.trim()) {
        errors.lineItems = 'All line items must have a title';
        break;
      }
      const num = parseFloat(li.amount);
      if (isNaN(num) || num < 0) {
        errors.lineItems = 'All line items must have a valid positive amount';
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

    const parsedLineItems = validLineItems.map((li) => ({
      title: li.title.trim(),
      amount: parseFloat(li.amount),
    }));

    try {
      if (isEditing && compensation) {
        const result = await updateEmployeeCompensation(compensation.id, {
          effectiveFrom: effectiveFrom || undefined,
          effectiveTill: effectiveTill || undefined,
          isActive: compensation.isActive,
          lineItems: parsedLineItems,
        });
        onSuccess(result);
      } else {
        const result = await createEmployeeCompensation({
          employeeId,
          effectiveFrom,
          effectiveTill: effectiveTill || undefined,
          lineItems: parsedLineItems,
        });
        onSuccess(result);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      if (message.toLowerCase().includes('effective from')) {
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
      setEffectiveFrom(compensation?.effectiveFrom ?? '');
      setEffectiveTill(compensation?.effectiveTill ?? '');
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
      title={isEditing ? 'Edit compensation' : 'Add compensation'}
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
        {hasFieldErrors && <p className='rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive'>Please check the below errors to proceed</p>}
        {error && !hasFieldErrors && <p className='text-sm text-destructive'>{error}</p>}

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
            <div key={index} className='flex items-start gap-3'>
              <div className='flex flex-1 flex-col gap-1'>
                <Input
                  placeholder='Title (e.g. Basic, HRA)'
                  value={item.title}
                  onChange={(e) => updateLineItem(index, 'title', e.target.value)}
                />
              </div>
              <div className='flex w-36 flex-col gap-1'>
                <Input
                  type='number'
                  min={0}
                  step={1}
                  placeholder='Amount'
                  value={item.amount}
                  onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                />
              </div>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='mt-0.5 h-8 w-8 shrink-0 text-destructive hover:text-destructive'
                onClick={() => removeLineItem(index)}
                disabled={lineItems.length <= 1}
              >
                <Trash2 className='h-3.5 w-3.5' />
              </Button>
            </div>
          ))}
        </div>

        <hr className='border-border' />

        <div className='flex items-center justify-between'>
          <p className='text-sm font-medium text-muted-foreground'>Total (Gross)</p>
          <p className='text-lg font-semibold'>{formatAmount(grossAmount)}</p>
        </div>
      </div>
    </Drawer>
  );
}
