'use client';

import { DashboardWidget, DashboardWidgetIcon } from '@repo/ui/component/ui/dashboard-widget';
import { DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

import { searchPayrollActiveCompensations } from '@/lib/action/employee-compensation.actions';

export function DashboardPayrollCost() {
  const [data, setData] = useState<{ monthly: number; yearly: number; symbol: string } | null>(null);

  useEffect(() => {
    searchPayrollActiveCompensations({
      pagination: { page: 1, limit: 500 },
    }).then((result) => {
      const yearly = result.results.reduce((sum, c) => sum + c.grossAmount, 0);
      setData({ monthly: Math.round(yearly / 12), yearly, symbol: '₹' });
    });
  }, []);

  return (
    <DashboardWidget href='/payroll/compensation'>
      <div className='flex w-full items-start gap-5'>
        <DashboardWidgetIcon icon={DollarSign} />
        {data === null ? (
          <div className='h-9 w-16 animate-pulse rounded bg-muted' />
        ) : (
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-muted-foreground'>Monthly Payroll Cost</span>
            <span className='text-3xl font-semibold text-primary'>{data.symbol}{data.monthly.toLocaleString('en-IN')}</span>
            <span className='text-xs text-muted-foreground'>Yearly: {data.symbol}{data.yearly.toLocaleString('en-IN')}</span>
          </div>
        )}
      </div>
    </DashboardWidget>
  );
}
