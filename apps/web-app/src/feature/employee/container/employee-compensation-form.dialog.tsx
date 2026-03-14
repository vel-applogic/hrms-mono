'use client';

import type { EmployeeCompensationResponseType } from '@repo/dto';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/shadcn/dialog';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { useEffect, useState } from 'react';

import { createEmployeeCompensation, updateEmployeeCompensation } from '@/lib/action/employee-compensation.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  compensation?: EmployeeCompensationResponseType;
  /** Minimum allowed effectiveFrom (e.g. recent compensation's effectiveFrom). Cannot start with earlier dates. */
  minEffectiveFrom?: string;
  onSuccess: (compensation: EmployeeCompensationResponseType) => void;
}

export function EmployeeCompensationFormDialog({ open, onOpenChange, employeeId, compensation, minEffectiveFrom, onSuccess }: Props) {
  const isEditing = !!compensation;
  const [basic, setBasic] = useState(compensation?.basic?.toString() ?? '');
  const [hra, setHra] = useState(compensation?.hra?.toString() ?? '');
  const [otherAllowances, setOtherAllowances] = useState(compensation?.otherAllowances?.toString() ?? '');
  const [gross, setGross] = useState(compensation?.gross?.toString() ?? '');
  const [effectiveFrom, setEffectiveFrom] = useState(compensation?.effectiveFrom ?? '');
  const [effectiveTill, setEffectiveTill] = useState(compensation?.effectiveTill ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setBasic(compensation?.basic?.toString() ?? '');
      setHra(compensation?.hra?.toString() ?? '');
      setOtherAllowances(compensation?.otherAllowances?.toString() ?? '');
      setGross(compensation?.gross?.toString() ?? '');
      setEffectiveFrom(compensation?.effectiveFrom ?? '');
      setEffectiveTill(compensation?.effectiveTill ?? '');
      setError('');
    }
  }, [open, compensation]);

  const handleSubmit = async () => {
    const basicNum = parseFloat(basic);
    const hraNum = parseFloat(hra);
    const otherNum = parseFloat(otherAllowances);
    const grossNum = parseFloat(gross);
    if (isNaN(basicNum) || isNaN(hraNum) || isNaN(otherNum) || isNaN(grossNum)) {
      setError('All amount fields are required');
      return;
    }
    if (minEffectiveFrom && effectiveFrom && effectiveFrom < minEffectiveFrom) {
      setError(`Effective from cannot be earlier than ${minEffectiveFrom}`);
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing && compensation) {
        const result = await updateEmployeeCompensation(compensation.id, {
          basic: basicNum,
          hra: hraNum,
          otherAllowances: otherNum,
          gross: grossNum,
          effectiveFrom: effectiveFrom || undefined,
          effectiveTill: effectiveTill || undefined,
          isActive: compensation.isActive,
        });
        onSuccess(result);
      } else {
        const result = await createEmployeeCompensation({
          employeeId,
          basic: basicNum,
          hra: hraNum,
          otherAllowances: otherNum,
          gross: grossNum,
          effectiveFrom: effectiveFrom || undefined,
          effectiveTill: effectiveTill || undefined,
        });
        onSuccess(result);
      }
      setBasic('');
      setHra('');
      setOtherAllowances('');
      setGross('');
      setEffectiveFrom('');
      setEffectiveTill('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setBasic(compensation?.basic?.toString() ?? '');
      setHra(compensation?.hra?.toString() ?? '');
      setOtherAllowances(compensation?.otherAllowances?.toString() ?? '');
      setGross(compensation?.gross?.toString() ?? '');
      setEffectiveFrom(compensation?.effectiveFrom ?? '');
      setEffectiveTill(compensation?.effectiveTill ?? '');
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit compensation' : 'Add compensation'}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='basic'>Basic</Label>
              <Input id='basic' type='number' min={0} step={0.01} value={basic} onChange={(e) => setBasic(e.target.value)} placeholder='0' />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='hra'>HRA</Label>
              <Input id='hra' type='number' min={0} step={0.01} value={hra} onChange={(e) => setHra(e.target.value)} placeholder='0' />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='otherAllowances'>Other allowances</Label>
              <Input id='otherAllowances' type='number' min={0} step={0.01} value={otherAllowances} onChange={(e) => setOtherAllowances(e.target.value)} placeholder='0' />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='gross'>Gross</Label>
              <Input id='gross' type='number' min={0} step={0.01} value={gross} onChange={(e) => setGross(e.target.value)} placeholder='0' />
            </div>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='effectiveFrom'>Effective from</Label>
              <Input
                id='effectiveFrom'
                type='date'
                value={effectiveFrom}
                min={minEffectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label htmlFor='effectiveTill'>Effective till</Label>
              <Input id='effectiveTill' type='date' value={effectiveTill} onChange={(e) => setEffectiveTill(e.target.value)} />
            </div>
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
