'use client';

import { Widget } from '@repo/ui/component/ui/dashboard-widget';
import { DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getMonthlyPayrollCost } from '@/lib/action/employee-compensation.actions';

export function DashboardPayrollCost() {
  const [data, setData] = useState<{ monthly: number; yearly: number; symbol: string } | null>(null);

  useEffect(() => {
    getMonthlyPayrollCost().then(({ monthly, yearly }) => {
      setData({ monthly, yearly, symbol: '₹' });
    });
  }, []);

  return (
    <Widget label='Monthly Payroll Cost' icon={DollarSign} href='/payroll/compensation'>
      {data === null ? (
        <div className='h-9 w-16 animate-pulse rounded bg-muted' />
      ) : (
        <div className='flex flex-col'>
          <span className='text-3xl font-semibold text-primary'>{data.symbol}{data.monthly.toLocaleString('en-IN')}</span>
          <span className='text-xs text-muted-foreground'>Yearly: {data.symbol}{data.yearly.toLocaleString('en-IN')}</span>
        </div>
      )}
    </Widget>
  );
}
