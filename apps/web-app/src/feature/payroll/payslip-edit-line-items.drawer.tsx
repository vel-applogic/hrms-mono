'use client';

import type { PayslipDetailResponseType, PayrollPayslipLineItemTypeDtoEnum } from '@repo/dto';
import { cn } from '@repo/ui/lib/utils';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getPayslipById, updatePayslipLineItems } from '@/lib/action/payslip.actions';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatAmount(value: number, currencySymbol: string | null | undefined, currencyCode: string | undefined) {
  const prefix = currencySymbol ?? currencyCode ?? '';
  return `${prefix} ${value.toLocaleString('en-IN')}`;
}

interface LineItemDraft {
  key: string;
  type: PayrollPayslipLineItemTypeDtoEnum;
  title: string;
  amount: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslipId: number | null;
  onSuccess: (updated: PayslipDetailResponseType) => void;
}

export function PayslipEditLineItemsDrawer({ open, onOpenChange, payslipId, onSuccess }: Props) {
  const [payslip, setPayslip] = useState<PayslipDetailResponseType | null>(null);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && payslipId != null) {
      setFetchLoading(true);
      setError('');
      getPayslipById(payslipId)
        .then((p) => {
          setPayslip(p);
          setLineItems(
            p.lineItems.map((li, i) => ({
              key: `existing-${li.id}-${i}`,
              type: li.type,
              title: li.title,
              amount: String(li.amount),
            })),
          );
        })
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payslip'))
        .finally(() => setFetchLoading(false));
    }
  }, [open, payslipId]);

  const addLineItem = (type: PayrollPayslipLineItemTypeDtoEnum) => {
    setLineItems((prev) => [
      ...prev,
      { key: `new-${Date.now()}`, type, title: '', amount: '' },
    ]);
  };

  const removeLineItem = (key: string) => {
    setLineItems((prev) => prev.filter((li) => li.key !== key));
  };

  const updateItem = (key: string, field: keyof LineItemDraft, value: string) => {
    setLineItems((prev) => prev.map((li) => (li.key === key ? { ...li, [field]: value } : li)));
  };

  const getGross = () =>
    lineItems.filter((li) => li.type === 'earning').reduce((s, li) => s + (parseFloat(li.amount) || 0), 0);

  const getTotalDeductions = () =>
    lineItems.filter((li) => li.type === 'deduction').reduce((s, li) => s + (parseFloat(li.amount) || 0), 0);

  const handleSave = async () => {
    if (payslipId == null) return;

    const errors: string[] = [];
    lineItems.forEach((li, i) => {
      if (!li.title.trim()) errors.push(`Row ${i + 1}: Title is required`);
      const amt = parseFloat(li.amount);
      if (isNaN(amt) || amt < 0) errors.push(`Row ${i + 1}: Amount must be a valid non-negative number`);
    });

    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    if (lineItems.length === 0) {
      setError('At least one line item is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await updatePayslipLineItems(payslipId, {
        lineItems: lineItems.map((li) => ({
          type: li.type,
          title: li.title.trim(),
          amount: parseFloat(li.amount),
        })),
      });
      onSuccess(result);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const earnings = lineItems.filter((li) => li.type === 'earning');
  const deductions = lineItems.filter((li) => li.type === 'deduction');

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={
        payslip
          ? `Edit Line Items — ${MONTH_LABELS[(payslip.month ?? 1) - 1]} ${payslip.year}`
          : 'Edit Line Items'
      }
      description={payslip ? `${payslip.employeeFirstname} ${payslip.employeeLastname}` : undefined}
      footer={
        <div className='flex items-center justify-between'>
          <div className='text-sm'>
            <span className='text-muted-foreground'>Net Pay: </span>
            <span className='font-semibold text-primary'>{formatAmount(getGross() - getTotalDeductions(), payslip?.currencySymbol, payslip?.currencyCode)}</span>
          </div>
          <div className='flex gap-3'>
            <Button variant='outline' onClick={() => onOpenChange(false)} disabled={loading || fetchLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading || fetchLoading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      }
    >
      <div className='flex flex-col gap-6 p-6'>
        {fetchLoading && (
          <div className='flex items-center justify-center py-8'>
            <p className='text-sm text-muted-foreground'>Loading…</p>
          </div>
        )}

        {error && (
          <p className='rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            {error}
          </p>
        )}

        {!fetchLoading && (
          <>
            {/* Earnings Section */}
            <div>
              <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>Earnings</h3>
              <div className='flex flex-col gap-2'>
                {earnings.length === 0 && (
                  <p className='py-2 text-center text-sm text-muted-foreground'>No earnings added</p>
                )}
                {earnings.map((li) => (
                  <LineItemRow
                    key={li.key}
                    item={li}
                    onUpdate={(field, value) => updateItem(li.key, field, value)}
                    onRemove={() => removeLineItem(li.key)}
                  />
                ))}
                <div className='flex items-center justify-between pt-1'>
                  <button
                    type='button'
                    onClick={() => addLineItem('earning')}
                    className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <Plus className='h-4 w-4' />
                    Add earning
                  </button>
                  {earnings.length > 0 && (
                    <span className='text-sm text-muted-foreground'>
                      Gross: <strong className='text-foreground'>{formatAmount(getGross(), payslip?.currencySymbol, payslip?.currencyCode)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div>
              <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>Deductions</h3>
              <div className='flex flex-col gap-2'>
                {deductions.length === 0 && (
                  <p className='py-2 text-center text-sm text-muted-foreground'>No deductions added</p>
                )}
                {deductions.map((li) => (
                  <LineItemRow
                    key={li.key}
                    item={li}
                    onUpdate={(field, value) => updateItem(li.key, field, value)}
                    onRemove={() => removeLineItem(li.key)}
                  />
                ))}
                <div className='flex items-center justify-between pt-1'>
                  <button
                    type='button'
                    onClick={() => addLineItem('deduction')}
                    className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
                  >
                    <Plus className='h-4 w-4' />
                    Add deduction
                  </button>
                  {deductions.length > 0 && (
                    <span className='text-sm text-muted-foreground'>
                      Total Deductions: <strong className='text-destructive'>{formatAmount(getTotalDeductions(), payslip?.currencySymbol, payslip?.currencyCode)}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}

interface LineItemRowProps {
  item: LineItemDraft;
  onUpdate: (field: keyof LineItemDraft, value: string) => void;
  onRemove: () => void;
}

function LineItemRow({ item, onUpdate, onRemove }: LineItemRowProps) {
  return (
    <div className='grid grid-cols-[1fr_120px_auto] items-end gap-2 rounded-md border border-border bg-card p-3'>
      <div className='flex flex-col gap-1'>
        <Label className='text-xs text-muted-foreground'>Title</Label>
        <Input
          value={item.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          placeholder='e.g. Basic Salary'
          className={cn(!item.title.trim() && 'border-destructive/50')}
        />
      </div>
      <div className='flex flex-col gap-1'>
        <Label className='text-xs text-muted-foreground'>Amount</Label>
        <Input
          type='number'
          min={0}
          value={item.amount}
          onChange={(e) => onUpdate('amount', e.target.value)}
          placeholder='0'
          className={cn((!item.amount || parseFloat(item.amount) < 0) && 'border-destructive/50')}
        />
      </div>
      <Button
        size='icon'
        variant='ghost'
        onClick={onRemove}
        className='h-9 w-9 text-muted-foreground hover:text-destructive'
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  );
}
