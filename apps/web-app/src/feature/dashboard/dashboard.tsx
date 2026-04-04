'use client';

import type { EmployeeListResponseType, HolidayResponseType } from '@repo/dto';
import { CandidateStatusDtoEnum, EmployeeStatusDtoEnum, LeaveStatusDtoEnum } from '@repo/dto';
import { AlertTriangle, Cake, CalendarDays, Clock, DollarSign, FileWarning, UserCheck, UserRound, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { getCandidatesList } from '@/lib/action/candidate.actions';
import { searchPayrollActiveCompensations } from '@/lib/action/employee-compensation.actions';
import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';
import { searchHolidays } from '@/lib/action/holiday.actions';
import { searchLeaves } from '@/lib/action/leave.actions';

type LeaveEntry = { userId: number; firstname: string; lastname: string; startDate: string; endDate: string };

type NameEntry = { id: number; firstname: string; lastname: string };

interface DashboardData {
  employeeCount: number;
  employeesByStatus: Record<string, number>;
  newCandidateCount: number;
  candidatesByStatus: Record<string, number>;
  pendingLeaveCount: number;
  upcomingHolidays: HolidayResponseType[];
  onLeaveToday: LeaveEntry[];
  onLeaveThisWeek: LeaveEntry[];
  upcomingAnniversaries: { id: number; firstname: string; lastname: string; dateOfJoining: string; years: number }[];
  noReportingManager: NameEntry[];
  totalPayrollCost: number;
  currencySymbol: string;
  withoutCompensation: NameEntry[];
  withoutDeduction: NameEntry[];
  loaded: boolean;
}

const EMPLOYEE_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  resigned: 'Resigned',
  onLeave: 'On Leave',
  terminated: 'Terminated',
};

const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  planed: 'Planned',
  notReachable: 'Not Reachable',
  selected: 'Selected',
  onHold: 'On Hold',
  rejected: 'Rejected',
};

function getEndOfWeek(today: Date): string {
  const end = new Date(today);
  const dayOfWeek = end.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  end.setDate(end.getDate() + daysUntilSunday);
  return end.toISOString().split('T')[0]!;
}

function getUpcomingAnniversaries(employees: EmployeeListResponseType[]): DashboardData['upcomingAnniversaries'] {
  const today = new Date();
  const currentYear = today.getFullYear();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);
  const in30DaysMD = `${String(in30Days.getMonth() + 1).padStart(2, '0')}-${String(in30Days.getDate()).padStart(2, '0')}`;

  return employees
    .filter((emp) => emp.status === EmployeeStatusDtoEnum.active && emp.dateOfJoining)
    .map((emp) => {
      const joiningDate = new Date(emp.dateOfJoining + 'T00:00:00');
      const joiningMD = `${String(joiningDate.getMonth() + 1).padStart(2, '0')}-${String(joiningDate.getDate()).padStart(2, '0')}`;
      const years = currentYear - joiningDate.getFullYear();
      return { id: emp.id, firstname: emp.firstname, lastname: emp.lastname, dateOfJoining: emp.dateOfJoining, joiningMD, years };
    })
    .filter((emp) => emp.years > 0 && emp.joiningMD >= todayMD && emp.joiningMD <= in30DaysMD)
    .sort((a, b) => a.joiningMD.localeCompare(b.joiningMD))
    .map(({ joiningMD: _, ...rest }) => rest);
}

export function Dashboard() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  const [data, setData] = useState<DashboardData>({
    employeeCount: 0,
    employeesByStatus: {},
    newCandidateCount: 0,
    candidatesByStatus: {},
    pendingLeaveCount: 0,
    upcomingHolidays: [],
    onLeaveToday: [],
    onLeaveThisWeek: [],
    upcomingAnniversaries: [],
    noReportingManager: [],
    totalPayrollCost: 0,
    currencySymbol: '',
    withoutCompensation: [],
    withoutDeduction: [],
    loaded: false,
  });

  useEffect(() => {
    if (!currentUserId) return;

    const fetchData = async () => {
      const [employees, candidates, holidays, pendingLeaves, approvedLeaves, activeCompensations] = await Promise.all([
        getEmployeesList(),
        getCandidatesList(),
        searchHolidays({
          year: new Date().getFullYear(),
          pagination: { page: 1, limit: 100 },
        }),
        searchLeaves({
          pagination: { page: 1, limit: 1 },
          status: [LeaveStatusDtoEnum.pending],
        }),
        searchLeaves({
          pagination: { page: 1, limit: 500 },
          status: [LeaveStatusDtoEnum.approved],
        }),
        searchPayrollActiveCompensations({
          pagination: { page: 1, limit: 500 },
        }),
      ]);

      // Employee count by status
      const employeesByStatus: Record<string, number> = {};
      for (const emp of employees) {
        employeesByStatus[emp.status] = (employeesByStatus[emp.status] ?? 0) + 1;
      }

      // Candidate count by status
      const candidatesByStatus: Record<string, number> = {};
      for (const c of candidates) {
        candidatesByStatus[c.status] = (candidatesByStatus[c.status] ?? 0) + 1;
      }

      const newCandidateCount = candidates.filter((c) => c.status === CandidateStatusDtoEnum.new).length;
      const pendingLeaveCount = pendingLeaves.totalRecords;

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]!;
      const endOfWeekStr = getEndOfWeek(today);

      const mapLeave = (l: (typeof approvedLeaves.results)[number]): LeaveEntry => ({
        userId: l.userId,
        firstname: l.user.firstname,
        lastname: l.user.lastname,
        startDate: l.startDate,
        endDate: l.endDate,
      });

      const onLeaveToday = approvedLeaves.results
        .filter((l) => l.startDate <= todayStr && l.endDate >= todayStr)
        .map(mapLeave);

      // Upcoming leaves this week (excluding today, from tomorrow to end of week)
      const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0]!;
      const onLeaveThisWeek = approvedLeaves.results
        .filter((l) => {
          // Leave overlaps with tomorrow..endOfWeek range and is NOT already in onLeaveToday
          const overlapsWeek = l.startDate <= endOfWeekStr && l.endDate >= tomorrowStr;
          const isAlreadyToday = l.startDate <= todayStr && l.endDate >= todayStr;
          return overlapsWeek && !isAlreadyToday;
        })
        .map(mapLeave);

      const upcomingHolidays = holidays.results
        .filter((h) => h.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 2);

      const upcomingAnniversaries = getUpcomingAnniversaries(employees);

      const activeEmployees = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      const noReportingManager = activeEmployees
        .filter((e) => !e.reportToId)
        .map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname }));

      // Payroll: total cost + employees without compensation
      const totalPayrollCost = activeCompensations.results.reduce((sum, c) => sum + c.grossAmount, 0);
      const currencySymbol = activeCompensations.results[0]?.employeeCode ? '₹' : '₹';
      const employeeIdsWithCompensation = new Set(activeCompensations.results.map((c) => c.employeeId));
      const withoutCompensation = activeEmployees
        .filter((e) => !employeeIdsWithCompensation.has(e.id))
        .map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname }));

      // Employees without deduction: check each active employee
      const deductionChecks = await Promise.all(
        activeEmployees.map(async (e) => {
          const result = await searchEmployeeDeductions({ employeeId: e.id, pagination: { page: 1, limit: 1 } });
          return { id: e.id, firstname: e.firstname, lastname: e.lastname, hasDeduction: result.totalRecords > 0 };
        }),
      );
      const withoutDeduction = deductionChecks
        .filter((d) => !d.hasDeduction)
        .map((d) => ({ id: d.id, firstname: d.firstname, lastname: d.lastname }));

      setData({
        employeeCount: employees.length,
        employeesByStatus,
        newCandidateCount,
        candidatesByStatus,
        pendingLeaveCount,
        upcomingHolidays,
        onLeaveToday,
        onLeaveThisWeek,
        upcomingAnniversaries,
        noReportingManager,
        totalPayrollCost,
        currencySymbol,
        withoutCompensation,
        withoutDeduction,
        loaded: true,
      });
    };

    fetchData();
  }, [currentUserId]);

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-xl font-medium tracking-tight'>Dashboard</h1>

      {/* Row 1: Key stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard icon={Users} label='Employees' value={data.loaded ? data.employeeCount : null} />
        <StatCard icon={UserRound} label='New Candidates' value={data.loaded ? data.newCandidateCount : null} />
        <StatCard icon={Clock} label='Leave Approvals Pending' value={data.loaded ? data.pendingLeaveCount : null} />
        <div className='rounded-lg border border-border bg-card p-5'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <CalendarDays className='h-5 w-5' />
            <span className='text-sm font-medium'>Upcoming Holidays</span>
          </div>
          {!data.loaded ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : data.upcomingHolidays.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {data.upcomingHolidays.map((h) => (
                <div key={h.id} className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{h.name}</span>
                  <span className='text-sm text-muted-foreground'>{formatDate(h.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No upcoming holidays</p>
          )}
        </div>
      </div>

      {/* Row 2: Employee status + Candidate status */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <Users className='h-5 w-5' />
            <span className='text-sm font-medium'>Employees by Status</span>
          </div>
          {!data.loaded ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex flex-wrap gap-4'>
              {Object.values(EmployeeStatusDtoEnum).map((status) => (
                <div key={status} className='flex flex-col'>
                  <span className='text-2xl font-semibold'>{data.employeesByStatus[status] ?? 0}</span>
                  <span className='text-xs text-muted-foreground'>{EMPLOYEE_STATUS_LABELS[status] ?? status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <UserRound className='h-5 w-5' />
            <span className='text-sm font-medium'>Candidates by Status</span>
          </div>
          {!data.loaded ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex flex-wrap gap-4'>
              {Object.values(CandidateStatusDtoEnum).map((status) => (
                <div key={status} className='flex flex-col'>
                  <span className='text-2xl font-semibold'>{data.candidatesByStatus[status] ?? 0}</span>
                  <span className='text-xs text-muted-foreground'>{CANDIDATE_STATUS_LABELS[status] ?? status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: On leave today + Upcoming leaves this week */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <LeaveWidget
          icon={UserCheck}
          label='On Leave Today'
          entries={data.onLeaveToday}
          loaded={data.loaded}
        />
        <LeaveWidget
          icon={CalendarDays}
          label='Upcoming Leaves This Week'
          entries={data.onLeaveThisWeek}
          loaded={data.loaded}
        />
      </div>

      {/* Row 4: Anniversaries + No reporting manager */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <Cake className='h-5 w-5' />
            <span className='text-sm font-medium'>Upcoming Work Anniversaries</span>
          </div>
          {!data.loaded ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : data.upcomingAnniversaries.length > 0 ? (
            <div className='flex flex-col gap-2'>
              {data.upcomingAnniversaries.map((e) => (
                <div key={e.id} className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{e.firstname} {e.lastname}</span>
                  <span className='text-xs text-muted-foreground'>
                    {formatDate(e.dateOfJoining)} &middot; {e.years} {e.years === 1 ? 'year' : 'years'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No upcoming anniversaries in the next 30 days</p>
          )}
        </div>
        <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <AlertTriangle className='h-5 w-5' />
            <span className='text-sm font-medium'>No Reporting Manager</span>
          </div>
          {!data.loaded ? (
            <div className='h-12 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex items-start gap-6'>
              <p className='text-3xl font-semibold'>{data.noReportingManager.length}</p>
              {data.noReportingManager.length > 0 ? (
                <p className='text-sm text-muted-foreground'>
                  {data.noReportingManager.map((e) => `${e.firstname} ${e.lastname}`).join(', ')}
                </p>
              ) : (
                <p className='text-sm text-muted-foreground'>All active employees have a reporting manager</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Payroll */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-border bg-card p-5'>
          <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
            <DollarSign className='h-5 w-5' />
            <span className='text-sm font-medium'>Total Payroll Cost</span>
          </div>
          {!data.loaded ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <p className='text-3xl font-semibold'>{data.currencySymbol}{data.totalPayrollCost.toLocaleString('en-IN')}</p>
          )}
        </div>
        <NameListWidget
          icon={FileWarning}
          label='Without Compensation'
          entries={data.withoutCompensation}
          loaded={data.loaded}
          emptyMessage='All active employees have compensation'
        />
        <NameListWidget
          icon={FileWarning}
          label='Without Deduction'
          entries={data.withoutDeduction}
          loaded={data.loaded}
          emptyMessage='All active employees have deductions'
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | null }) {
  return (
    <div className='rounded-lg border border-border bg-card p-5'>
      <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
        <Icon className='h-5 w-5' />
        <span className='text-sm font-medium'>{label}</span>
      </div>
      {value === null ? (
        <div className='h-9 w-16 animate-pulse rounded bg-muted' />
      ) : (
        <p className='text-3xl font-semibold'>{value}</p>
      )}
    </div>
  );
}

function LeaveWidget({ icon: Icon, label, entries, loaded }: { icon: React.ComponentType<{ className?: string }>; label: string; entries: LeaveEntry[]; loaded: boolean }) {
  return (
    <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
      <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
        <Icon className='h-5 w-5' />
        <span className='text-sm font-medium'>{label}</span>
      </div>
      {!loaded ? (
        <div className='h-9 w-16 animate-pulse rounded bg-muted' />
      ) : (
        <div className='flex items-start gap-6'>
          <p className='text-3xl font-semibold'>{entries.length}</p>
          {entries.length > 0 && (
            <div className='flex flex-col gap-2'>
              {entries.map((l) => (
                <div key={l.userId} className='flex items-center justify-between gap-4'>
                  <span className='text-sm font-medium'>{l.firstname} {l.lastname}</span>
                  <span className='text-xs text-muted-foreground'>{formatDate(l.startDate)} - {formatDate(l.endDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NameListWidget({ icon: Icon, label, entries, loaded, emptyMessage }: { icon: React.ComponentType<{ className?: string }>; label: string; entries: NameEntry[]; loaded: boolean; emptyMessage: string }) {
  return (
    <div className='rounded-lg border border-border bg-card p-5'>
      <div className='mb-2 flex items-center gap-2 text-muted-foreground'>
        <Icon className='h-5 w-5' />
        <span className='text-sm font-medium'>{label}</span>
      </div>
      {!loaded ? (
        <div className='h-9 w-16 animate-pulse rounded bg-muted' />
      ) : (
        <div className='flex items-start gap-6'>
          <p className='text-3xl font-semibold'>{entries.length}</p>
          {entries.length > 0 ? (
            <p className='text-sm text-muted-foreground'>
              {entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ')}
            </p>
          ) : (
            <p className='text-sm text-muted-foreground'>{emptyMessage}</p>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
