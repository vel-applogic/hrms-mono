'use client';

import type { PayslipDetailResponseType } from '@repo/dto';
import { Dialog, DialogContent } from '@repo/ui/component/shadcn/dialog';
import { ScrollArea } from '@repo/ui/component/ui/scroll-area';
import { useEffect, useState } from 'react';

import { getPayslipById } from '@/lib/action/payslip.actions';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatAmount(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function toWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n]!;
  if (n < 100) return TENS[Math.floor(n / 10)]! + (n % 10 ? ' ' + ONES[n % 10]! : '');
  if (n < 1000) return ONES[Math.floor(n / 100)]! + ' Hundred' + (n % 100 ? ' ' + toWords(n % 100) : '');
  if (n < 100000) return toWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + toWords(n % 1000) : '');
  if (n < 10000000) return toWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + toWords(n % 100000) : '');
  return toWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + toWords(n % 10000000) : '');
}

function numberToWords(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let result = toWords(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + toWords(paise) + ' Paise';
  return result + ' Only';
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
  const lopItem = deductions.find((li) => li.title === 'Loss of Pay');
  const maxRows = Math.max(earnings.length, deductions.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl p-0 bg-white text-gray-900'>
        <ScrollArea className='max-h-[90vh]'>

          {loading && (
            <div className='flex items-center justify-center py-16'>
              <p className='text-sm text-gray-500'>Loading payslip…</p>
            </div>
          )}

          {error && (
            <p className='m-6 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>
          )}

          {payslip && (
            <div className='flex flex-col text-sm text-gray-800'>

              {/* Company Header */}
              <div className='flex items-start gap-4 border-b border-gray-200 px-6 py-5'>
                <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded border border-gray-300 bg-gray-100 text-xs text-gray-400'>
                  Logo
                </div>
                <div>
                  <p className='text-base font-bold text-gray-900'>Company Name</p>
                  <p className='text-xs text-gray-500'>Company Address</p>
                  <p className='mt-1 font-semibold text-gray-700'>
                    Payslip for the Month of {MONTH_LABELS[payslip.month - 1]} {payslip.year}
                  </p>
                </div>
              </div>

              {/* Employee Info + Net Pay */}
              <div className='grid grid-cols-2 gap-0 border-b border-gray-200'>
                {/* Left — Employee details */}
                <div className='border-r border-gray-200 px-6 py-4'>
                  <table className='w-full text-xs'>
                    <tbody>
                      <InfoRow label='Employee Name' value={`${payslip.employeeFirstname} ${payslip.employeeLastname}`} bold />
                      <InfoRow label='Employee ID' value={String(payslip.employeeId)} />
                      <InfoRow label='Pay Period' value={`${MONTH_LABELS[payslip.month - 1]} ${payslip.year}`} />
                      <InfoRow
                        label='Pay Date'
                        value={new Date(payslip.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      />
                      <InfoRow label='Email' value={payslip.employeeEmail} />
                    </tbody>
                  </table>
                </div>

                {/* Right — Net pay + LOP */}
                <div className='px-6 py-4'>
                  <div className='mb-3 rounded border border-green-200 bg-green-50 px-4 py-3'>
                    <p className='text-xl font-bold text-green-600'>{formatAmount(payslip.netAmount)}</p>
                    <p className='text-xs text-gray-500'>Total Net Pay</p>
                  </div>
                  <table className='w-full text-xs'>
                    <tbody>
                      <InfoRow label='Gross Earnings' value={formatAmount(payslip.grossAmount)} />
                      <InfoRow label='Total Deductions' value={formatAmount(payslip.deductionAmount)} />
                      {lopItem && <InfoRow label='LOP Deduction' value={formatAmount(lopItem.amount)} />}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Income Details */}
              <div className='px-6 py-4'>
                <p className='mb-3 font-semibold text-gray-800'>Income Details</p>

                <div className='grid grid-cols-2 gap-4'>
                  {/* Earnings table */}
                  <table className='w-full border border-gray-200 text-xs'>
                    <thead>
                      <tr className='bg-gray-100'>
                        <th className='border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-700'>Earnings</th>
                        <th className='border-b border-gray-200 px-3 py-2 text-right font-semibold text-gray-700'>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: maxRows }).map((_, i) => {
                        const li = earnings[i];
                        return (
                          <tr key={i} className='border-b border-gray-100'>
                            <td className='border-r border-gray-100 px-3 py-2 text-gray-700'>{li?.title ?? ''}</td>
                            <td className='px-3 py-2 text-right text-gray-700'>{li ? formatAmount(li.amount) : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className='bg-gray-100'>
                        <td className='border-r border-t border-gray-200 px-3 py-2 font-semibold text-gray-800'>Gross Earnings</td>
                        <td className='border-t border-gray-200 px-3 py-2 text-right font-semibold text-gray-800'>{formatAmount(payslip.grossAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Deductions table */}
                  <table className='w-full border border-gray-200 text-xs'>
                    <thead>
                      <tr className='bg-gray-100'>
                        <th className='border-b border-r border-gray-200 px-3 py-2 text-left font-semibold text-gray-700'>Deductions</th>
                        <th className='border-b border-gray-200 px-3 py-2 text-right font-semibold text-gray-700'>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: maxRows }).map((_, i) => {
                        const li = deductions[i];
                        return (
                          <tr key={i} className='border-b border-gray-100'>
                            <td className='border-r border-gray-100 px-3 py-2 text-gray-700'>{li?.title ?? ''}</td>
                            <td className='px-3 py-2 text-right text-gray-700'>{li ? formatAmount(li.amount) : ''}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className='bg-gray-100'>
                        <td className='border-r border-t border-gray-200 px-3 py-2 font-semibold text-gray-800'>Total Deductions</td>
                        <td className='border-t border-gray-200 px-3 py-2 text-right font-semibold text-gray-800'>{formatAmount(payslip.deductionAmount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Net Payable Summary */}
              <div className='border-t border-gray-200 px-6 py-5 text-center'>
                <p className='font-semibold text-gray-800'>Total Net Payable</p>
                <p className='mt-0.5 text-xs text-gray-500'>Gross Earnings - Total Deductions</p>
                <p className='mt-2 text-2xl font-bold text-green-600'>{formatAmount(payslip.netAmount)}</p>
                <p className='mt-1 text-xs italic text-gray-500'>Amount In Words: {numberToWords(payslip.netAmount)}</p>
              </div>

              {/* Footer */}
              <div className='border-t border-gray-200 px-6 py-3 text-center'>
                <p className='text-xs text-gray-400'>– This is a system-generated document. –</p>
              </div>

            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <tr>
      <td className='py-0.5 pr-2 text-gray-500'>{label}</td>
      <td className='py-0.5 pl-1 text-gray-400'>:</td>
      <td className={`py-0.5 pl-2 ${bold ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{value}</td>
    </tr>
  );
}
