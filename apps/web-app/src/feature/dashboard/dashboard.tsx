'use client';

import type { DashboardStatsResponseType } from '@repo/dto';
import { useEffect, useState } from 'react';

import { ExpenseForecastWidget } from '@/feature/expense-forecast/component/expense-forecast-widget';
import { ExpenseSummaryWidget } from '@/feature/expense/component/expense-summary-widget';
import { DashboardPendingReimbursement } from '@/feature/reimbursement/component/reimbursement-pending-widget';
import { getDashboardStats } from '@/lib/action/dashboard.actions';

import { DashboardAnniversary } from './widget/dashboard-anniversary-widget';
import { DashboardCandidateCount } from './widget/dashboard-candidate-count-widget';
import { DashboardCandidateStatus } from './widget/dashboard-candidate-status-widget';
import { DashboardEmployeeCount } from './widget/dashboard-employee-count-widget';
import { DashboardEmployeeStatus } from './widget/dashboard-employee-status-widget';
import { DashboardLeaveNext7Day } from './widget/dashboard-leave-next7day-widget';
import { DashboardNoReportingManager } from './widget/dashboard-no-reporting-manager-widget';
import { DashboardOnLeaveToday } from './widget/dashboard-on-leave-today-widget';
import { DashboardPayrollCost } from './widget/dashboard-payroll-cost-widget';
import { DashboardPendingLeave } from './widget/dashboard-pending-leave-widget';
import { DashboardUpcomingHoliday } from './widget/dashboard-upcoming-holiday-widget';
import { DashboardWithoutCompensation } from './widget/dashboard-without-compensation-widget';
import { DashboardWithoutDeduction } from './widget/dashboard-without-deduction-widget';

interface DashboardProps {
  hideAdminWidgets?: boolean;
  employeeId?: number;
}

export function Dashboard({ hideAdminWidgets, employeeId }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStatsResponseType | null>(null);

  useEffect(() => {
    if (!hideAdminWidgets) {
      getDashboardStats().then(setStats).catch(() => {});
    }
  }, [hideAdminWidgets]);

  return (
    <div className='flex flex-col gap-6'>
      {/* Row 1: Key stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {!hideAdminWidgets && <DashboardEmployeeCount stats={stats} />}
        {!hideAdminWidgets && <DashboardCandidateCount stats={stats} />}
        <DashboardPendingLeave employeeId={employeeId} />
        <DashboardPendingReimbursement employeeId={employeeId} />
        <DashboardUpcomingHoliday isEmployee={hideAdminWidgets} />
      </div>

      {/* Row 2: Employee status + Candidate status */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <DashboardEmployeeStatus stats={stats} />
          <DashboardCandidateStatus stats={stats} />
        </div>
      )}

      {/* Row 3: On leave today + Next 7 days */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <DashboardOnLeaveToday />
        <DashboardLeaveNext7Day />
      </div>

      {/* Row 4: Anniversaries + No reporting manager */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <DashboardAnniversary />
          <DashboardNoReportingManager stats={stats} />
        </div>
      )}

      {/* Row 5: Payroll */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <DashboardPayrollCost />
          <DashboardWithoutCompensation stats={stats} />
          <DashboardWithoutDeduction stats={stats} />
        </div>
      )}

      {/* Row 6: Expenses */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <ExpenseSummaryWidget />
          <ExpenseForecastWidget />
        </div>
      )}
    </div>
  );
}
