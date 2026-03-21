'use client';

import type { PayslipDetailResponseType } from '@repo/dto';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/component/shadcn/dialog';
import { ScrollArea } from '@repo/ui/component/ui/scroll-area';
import { useEffect, useState } from 'react';

import { getPayslipById } from '@/lib/action/payslip.actions';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatAmount(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslipId: number | null;
}

export function PayslipViewDrawer({ open, onOpenChange, payslipId }: Props) {
  const [payslip, setPayslip] = useState<PayslipDetailResponseType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && payslipId != null) {
      setLoading(true);
      setError('');
      setPayslip(null);
      getPayslipById(payslipId)
        .then(setPayslip)
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payslip'))
        .finally(() => setLoading(false));
    }
  }, [open, payslipId]);

  const earnings = payslip?.lineItems.filter((li) => li.type === 'earning') ?? [];
  const deductions = payslip?.lineItems.filter((li) => li.type === 'deduction') ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl p-0'>
        <DialogHeader className='border-b px-6 pb-4 pt-5'>
          <DialogTitle>
            {payslip ? `Payslip — ${MONTH_LABELS[payslip.month - 1]} ${payslip.year}` : 'Payslip'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className='max-h-[80vh]'>
          <div className='flex flex-col gap-6 p-6'>
            {loading && (
              <div className='flex items-center justify-center py-12'>
                <p className='text-sm text-muted-foreground'>Loading payslip…</p>
              </div>
            )}

            {error && (
              <p className='rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                {error}
              </p>
            )}

            {payslip && (
              <>
                {/* Header */}
                <div className='rounded-lg border border-border bg-card p-5'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <h2 className='text-lg font-semibold text-white'>
                        {payslip.employeeFirstname} {payslip.employeeLastname}
                      </h2>
                      <p className='text-sm text-muted-foreground'>{payslip.employeeEmail}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium text-white'>
                        {MONTH_LABELS[payslip.month - 1]} {payslip.year}
                      </p>
                      <p className='text-xs text-muted-foreground'>Pay Period</p>
                    </div>
                  </div>
                </div>

                {/* Earnings */}
                <div>
                  <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                    Earnings
                  </h3>
                  <div className='overflow-hidden rounded-lg border border-border'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/40'>
                        <tr>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>Component</th>
                          <th className='px-4 py-2.5 text-right text-xs font-medium text-muted-foreground'>Amount</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-border'>
                        {earnings.length === 0 ? (
                          <tr>
                            <td colSpan={2} className='px-4 py-3 text-center text-xs text-muted-foreground'>
                              No earnings
                            </td>
                          </tr>
                        ) : (
                          earnings.map((li) => (
                            <tr key={li.id}>
                              <td className='px-4 py-3 text-white'>{li.title}</td>
                              <td className='px-4 py-3 text-right font-medium text-white'>
                                {formatAmount(li.amount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className='border-t border-border bg-muted/20'>
                        <tr>
                          <td className='px-4 py-3 text-sm font-semibold text-white'>Gross Salary</td>
                          <td className='px-4 py-3 text-right text-sm font-semibold text-white'>
                            {formatAmount(payslip.grossAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className='mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground'>
                    Deductions
                  </h3>
                  <div className='overflow-hidden rounded-lg border border-border'>
                    <table className='w-full text-sm'>
                      <thead className='bg-muted/40'>
                        <tr>
                          <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>Component</th>
                          <th className='px-4 py-2.5 text-right text-xs font-medium text-muted-foreground'>Amount</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-border'>
                        {deductions.length === 0 ? (
                          <tr>
                            <td colSpan={2} className='px-4 py-3 text-center text-xs text-muted-foreground'>
                              No deductions
                            </td>
                          </tr>
                        ) : (
                          deductions.map((li) => (
                            <tr key={li.id}>
                              <td className='px-4 py-3 text-white'>{li.title}</td>
                              <td className='px-4 py-3 text-right font-medium text-destructive'>
                                - {formatAmount(li.amount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot className='border-t border-border bg-muted/20'>
                        <tr>
                          <td className='px-4 py-3 text-sm font-semibold text-white'>Total Deductions</td>
                          <td className='px-4 py-3 text-right text-sm font-semibold text-destructive'>
                            - {formatAmount(payslip.deductionAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Net Pay Summary */}
                <div className='rounded-lg border border-primary/40 bg-primary/10 p-5'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>Net Pay</p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        Gross ({formatAmount(payslip.grossAmount)}) − Deductions (
                        {formatAmount(payslip.deductionAmount)})
                      </p>
                    </div>
                    <p className='text-2xl font-bold text-primary'>{formatAmount(payslip.netAmount)}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
