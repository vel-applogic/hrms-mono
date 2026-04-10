'use client';

import type { ExpenseSummaryResponseType } from '@repo/dto';
import { getFinancialYearCode } from '@repo/shared';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { IndianRupee, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getExpenseSummary } from '@/lib/action/expense.actions';

interface Props {
  refreshKey?: number;
  financialYearCode?: string;
}

export function ExpenseSummaryWidget({ refreshKey, financialYearCode }: Props) {
  const fyCode = financialYearCode ?? getFinancialYearCode(new Date());
  const [data, setData] = useState<ExpenseSummaryResponseType | null>(null);

  useEffect(() => {
    getExpenseSummary().then(setData);
  }, [refreshKey]);

  return (
    <>
      <DashboardWidget href='/expense'>
        <div className='flex w-full items-start gap-5'>
          <DashboardWidgetIcon icon={IndianRupee} />
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-muted-foreground'>This Month Expense</span>
            {data === null ? (
              <div className='h-9 w-16 animate-pulse rounded bg-muted' />
            ) : (
              <span className='text-3xl font-semibold text-orange-500'>
                {`₹ ${data.thisMonthTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            )}
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget href='/expense'>
        <div className='flex w-full items-start gap-5'>
          <DashboardWidgetIcon icon={TrendingUp} />
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-muted-foreground'>{fyCode} Expense</span>
            {data === null ? (
              <div className='h-9 w-16 animate-pulse rounded bg-muted' />
            ) : (
              <span className='text-3xl font-semibold text-orange-500'>
                {`₹ ${data.financialYearTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            )}
          </div>
        </div>
      </DashboardWidget>
    </>
  );
}
