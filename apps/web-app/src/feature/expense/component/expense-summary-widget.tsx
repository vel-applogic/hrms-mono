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
  compact?: boolean;
}

export function ExpenseSummaryWidget({ refreshKey, financialYearCode, compact }: Props) {
  const fyCode = financialYearCode ?? getFinancialYearCode(new Date());
  const [data, setData] = useState<ExpenseSummaryResponseType | null>(null);

  useEffect(() => {
    getExpenseSummary().then(setData);
  }, [refreshKey]);

  return (
    <>
      <DashboardWidget href='/expense' compact={compact}>
        <div className={`flex w-full flex-col ${compact ? 'gap-1.5' : 'gap-3'}`}>
          <span className={`font-semibold text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>This Month Expense</span>
          <div className={`flex items-center ${compact ? 'gap-3' : 'gap-5'}`}>
            <DashboardWidgetIcon icon={IndianRupee} compact={compact} />
            {data === null ? (
              <div className='h-9 w-16 animate-pulse rounded bg-muted' />
            ) : (
              <span className={`font-semibold text-orange-500 ${compact ? 'text-2xl' : 'text-3xl'}`}>
                {`₹ ${data.thisMonthTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            )}
          </div>
        </div>
      </DashboardWidget>

      <DashboardWidget href='/expense' compact={compact}>
        <div className={`flex w-full flex-col ${compact ? 'gap-1.5' : 'gap-3'}`}>
          <span className={`font-semibold text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>{fyCode} Expense</span>
          <div className={`flex items-center ${compact ? 'gap-3' : 'gap-5'}`}>
            <DashboardWidgetIcon icon={TrendingUp} compact={compact} />
            {data === null ? (
              <div className='h-9 w-16 animate-pulse rounded bg-muted' />
            ) : (
              <span className={`font-semibold text-orange-500 ${compact ? 'text-2xl' : 'text-3xl'}`}>
                {`₹ ${data.financialYearTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
              </span>
            )}
          </div>
        </div>
      </DashboardWidget>
    </>
  );
}
