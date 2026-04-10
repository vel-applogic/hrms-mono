'use client';

import type { ExpenseSummaryResponseType } from '@repo/dto';
import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { IndianRupee, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getExpenseSummary } from '@/lib/action/expense.actions';

export function DashboardExpenseThisMonth() {
  const [data, setData] = useState<ExpenseSummaryResponseType | null>(null);

  useEffect(() => {
    getExpenseSummary().then(setData);
  }, []);

  return (
    <DashboardWidget href='/expense'>
      <div className='flex w-full items-start gap-5'>
        <DashboardWidgetIcon icon={IndianRupee} />
        {data === null ? (
          <div className='h-9 w-16 animate-pulse rounded bg-muted' />
        ) : (
          <div className='flex flex-col'>
            <span className='text-3xl font-semibold text-primary'>
              {data.thisMonthTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </span>
            <span className='text-sm text-muted-foreground'>This Month Expense</span>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}

export function DashboardExpenseFinancialYear() {
  const [data, setData] = useState<ExpenseSummaryResponseType | null>(null);

  useEffect(() => {
    getExpenseSummary().then(setData);
  }, []);

  return (
    <DashboardWidget href='/expense'>
      <div className='flex w-full items-start gap-5'>
        <DashboardWidgetIcon icon={TrendingUp} />
        {data === null ? (
          <div className='h-9 w-16 animate-pulse rounded bg-muted' />
        ) : (
          <div className='flex flex-col'>
            <span className='text-3xl font-semibold text-primary'>
              {data.financialYearTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
            </span>
            <span className='text-sm text-muted-foreground'>FY Expense</span>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
