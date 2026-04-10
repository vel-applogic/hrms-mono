'use client';

import type { ExpenseSummaryResponseType } from '@repo/dto';
import { getFinancialYearCode } from '@repo/shared';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
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
      <Widget label='This Month Expense' icon={IndianRupee} href='/expense' compact={compact}>
        <WidgetInnerSingleCounter
          value={data?.thisMonthTotal ? `₹ ${data.thisMonthTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : null}
          valueColor='text-orange-500'
        />
      </Widget>

      <Widget label={`${fyCode} Expense`} icon={TrendingUp} href='/expense' compact={compact}>
        <WidgetInnerSingleCounter
          value={data?.financialYearTotal ? `₹ ${data.financialYearTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : null}
          valueColor='text-orange-500'
        />
      </Widget>
    </>
  );
}
