'use client';

import { Widget } from '@repo/ui/component/ui/dashboard-widget';
import { Calculator, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getExpenseForecastSummary } from '@/lib/action/expense-forecast.actions';

import { ExpenseForecastUpsertDrawer } from '../container/expense-forecast-upsert.drawer';

interface Props {
  refreshKey?: number;
  showEdit?: boolean;
  compact?: boolean;
}

export function ExpenseForecastWidget({ refreshKey, showEdit, compact }: Props) {
  const [monthlyTotal, setMonthlyTotal] = useState<number | null>(null);
  const [yearlyTotal, setYearlyTotal] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);

  useEffect(() => {
    getExpenseForecastSummary().then((data) => {
      setMonthlyTotal(data.monthlyTotal);
      setYearlyTotal(data.yearlyTotal);
    });
  }, [refreshKey, internalRefreshKey]);

  const handleSuccess = () => {
    setInternalRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Widget label='Monthly Forecast' icon={Calculator} compact={compact}>
        <div className='flex flex-1 flex-col'>
          {monthlyTotal === null ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <span className={`font-semibold text-blue-500 ${compact ? 'text-2xl' : 'text-3xl'}`}>
              {`₹ ${monthlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
            </span>
          )}
          {yearlyTotal !== null && (
            <span className='text-xs text-muted-foreground'>
              Yearly: <span className='font-semibold'>₹ {yearlyTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </span>
          )}
        </div>
        {showEdit && (
          <button
            onClick={() => setDrawerOpen(true)}
            className='inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
            title='Edit forecast'
          >
            <Pencil className='h-4 w-4' />
          </button>
        )}
      </Widget>

      {showEdit && <ExpenseForecastUpsertDrawer open={drawerOpen} onOpenChange={setDrawerOpen} onSuccess={handleSuccess} />}
    </>
  );
}
