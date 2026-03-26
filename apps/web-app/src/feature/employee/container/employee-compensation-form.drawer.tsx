'use client';

import type { EmployeeCompensationResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { cn } from '@repo/ui/lib/utils';
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

type FieldErrors = {
  gross?: string;
  effectiveFrom?: string;
  effectiveTill?: string;
};

export function EmployeeCompensationFormDrawer({ open, onOpenChange, employeeId, compensation, onSuccess }: Props) {
  const isEditing = !!compensation;
  const [gross, setGross] = useState(compensation?.gross?.toString() ?? '');
  const [effectiveFrom, setEffectiveFrom] = useState(compensation?.effectiveFrom ?? '');
  const [effectiveTill, setEffectiveTill] = useState(compensation?.effectiveTill ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setGross(compensation?.gross?.toString() ?? '');
      setEffectiveFrom(compensation?.effectiveFrom ?? '');
      setEffectiveTill(compensation?.effectiveTill ?? '');
      setError('');
      setFieldErrors({});
    }
  }, [open, compensation]);

  const { basic, hra, otherAllowances } = useMemo(() => {
    const grossNum = parseFloat(gross);
    if (isNaN(grossNum) || grossNum < 0) {
      return { basic: 0, hra: 0, otherAllowances: 0 };
    }
    const grossRounded = Math.round(grossNum);
    const b = Math.round(grossRounded * 0.4);
    const h = Math.round(grossRounded * 0.2);
    let o = Math.round(grossRounded * 0.2);
    const sum = b + h + o;
    const diff = grossRounded - sum;
    o += diff;
    return { basic: b, hra: h, otherAllowances: o };
  }, [gross]);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    const grossNum = parseFloat(gross);
    if (!gross.trim()) {
      errors.gross = 'Gross is required';
    } else if (isNaN(grossNum) || grossNum < 0) {
      errors.gross = 'Gross must be a valid positive number';
    }
    if (!isEditing && !effectiveFrom) {
      errors.effectiveFrom = 'Effective from is required';
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
      if (isEditing && compensation) {
        const result = await updateEmployeeCompensation(compensation.id, {
          basic,
          hra,
          otherAllowances,
          gross: grossNum,
          effectiveFrom: effectiveFrom || undefined,
          effectiveTill: effectiveTill || undefined,
          isActive: compensation.isActive,
        });
        onSuccess(result);
      } else {
        const result = await createEmployeeCompensation({
          employeeId,
          basic,
          hra,
          otherAllowances,
          gross: grossNum,
          effectiveFrom,
          effectiveTill: effectiveTill || undefined,
        });
        onSuccess(result);
      }
      setGross('');
      setEffectiveFrom('');
      setEffectiveTill('');
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
      setGross(compensation?.gross?.toString() ?? '');
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

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='gross'>Gross</Label>
            <Input
              id='gross'
              type='number'
              min={0}
              step={1}
              value={gross}
              onChange={(e) => {
                setGross(e.target.value);
                if (fieldErrors.gross) setFieldErrors((prev) => ({ ...prev, gross: undefined }));
              }}
              placeholder='0'
              className={cn(fieldErrors.gross && 'border-destructive')}
            />
            {fieldErrors.gross && <p className='text-sm text-destructive'>{fieldErrors.gross}</p>}
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

        <hr className='border-border' />

        <div className='flex flex-col gap-2'>
          <p className='text-sm text-muted-foreground'>
            Basic (40%): <span className='font-medium text-foreground'>{gross ? formatAmount(basic) : '—'}</span>
          </p>
          <p className='text-sm text-muted-foreground'>
            HRA (20%): <span className='font-medium text-foreground'>{gross ? formatAmount(hra) : '—'}</span>
          </p>
          <p className='text-sm text-muted-foreground'>
            Other allowance (20%): <span className='font-medium text-foreground'>{gross ? formatAmount(otherAllowances) : '—'}</span>
          </p>
        </div>
      </div>
    </Drawer>
  );
}
