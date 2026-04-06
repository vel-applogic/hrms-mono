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
  onLeaveNext7Days: LeaveEntry[];
  upcomingAnniversaries: { id: number; firstname: string; lastname: string; dateOfJoining: string; years: number }[];
  noReportingManager: NameEntry[];
  totalPayrollCost: number;
  currencySymbol: string;
  withoutCompensation: NameEntry[];
  withoutDeduction: NameEntry[];
  loaded: boolean;
}

const EMPLOYEE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'text-emerald-600' },
  resigned: { label: 'Resigned', color: 'text-amber-600' },
  onLeave: { label: 'On Leave', color: 'text-sky-600' },
  terminated: { label: 'Terminated', color: 'text-red-500' },
};

const CANDIDATE_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'text-sky-600' },
  planed: { label: 'Planned', color: 'text-indigo-600' },
  notReachable: { label: 'Not Reachable', color: 'text-amber-600' },
  selected: { label: 'Selected', color: 'text-emerald-600' },
  onHold: { label: 'On Hold', color: 'text-orange-500' },
  rejected: { label: 'Rejected', color: 'text-red-500' },
};

function getDatePlus7(today: Date): string {
  const end = new Date(today);
  end.setDate(end.getDate() + 7);
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

interface DashboardProps {
  hideAdminWidgets?: boolean;
}

export function Dashboard({ hideAdminWidgets }: DashboardProps) {
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
    onLeaveNext7Days: [],
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
      const [holidays, pendingLeaves, approvedLeaves] = await Promise.all([
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
      ]);

      const pendingLeaveCount = pendingLeaves.totalRecords;

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]!;
      const next7DaysStr = getDatePlus7(today);

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

      // Leaves for next 7 days (excluding today, from tomorrow to +7 days)
      const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0]!;
      const onLeaveNext7Days = approvedLeaves.results
        .filter((l) => {
          const overlaps = l.startDate <= next7DaysStr && l.endDate >= tomorrowStr;
          const isAlreadyToday = l.startDate <= todayStr && l.endDate >= todayStr;
          return overlaps && !isAlreadyToday;
        })
        .map(mapLeave);

      const upcomingHolidays = holidays.results
        .filter((h) => h.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 2);

      // Admin-only data: employees, candidates, payroll
      let employeeCount = 0;
      let employeesByStatus: Record<string, number> = {};
      let newCandidateCount = 0;
      let candidatesByStatus: Record<string, number> = {};
      let upcomingAnniversaries: DashboardData['upcomingAnniversaries'] = [];
      let noReportingManager: NameEntry[] = [];
      let totalPayrollCost = 0;
      let currencySymbol = '₹';
      let withoutCompensation: NameEntry[] = [];
      let withoutDeduction: NameEntry[] = [];

      if (!hideAdminWidgets) {
        const [employees, candidates, activeCompensations] = await Promise.all([
          getEmployeesList(),
          getCandidatesList(),
          searchPayrollActiveCompensations({
            pagination: { page: 1, limit: 500 },
          }),
        ]);

        employeeCount = employees.length;

        for (const emp of employees) {
          employeesByStatus[emp.status] = (employeesByStatus[emp.status] ?? 0) + 1;
        }

        for (const c of candidates) {
          candidatesByStatus[c.status] = (candidatesByStatus[c.status] ?? 0) + 1;
        }

        newCandidateCount = candidates.filter((c) => c.status === CandidateStatusDtoEnum.new).length;
        upcomingAnniversaries = getUpcomingAnniversaries(employees);

        const activeEmployees = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
        noReportingManager = activeEmployees
          .filter((e) => !e.reportToId)
          .map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname }));

        totalPayrollCost = activeCompensations.results.reduce((sum, c) => sum + c.grossAmount, 0);
        currencySymbol = activeCompensations.results[0]?.employeeCode ? '₹' : '₹';
        const employeeIdsWithCompensation = new Set(activeCompensations.results.map((c) => c.employeeId));
        withoutCompensation = activeEmployees
          .filter((e) => !employeeIdsWithCompensation.has(e.id))
          .map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname }));

        const deductionChecks = await Promise.all(
          activeEmployees.map(async (e) => {
            const result = await searchEmployeeDeductions({ employeeId: e.id, pagination: { page: 1, limit: 1 } });
            return { id: e.id, firstname: e.firstname, lastname: e.lastname, hasDeduction: result.totalRecords > 0 };
          }),
        );
        withoutDeduction = deductionChecks
          .filter((d) => !d.hasDeduction)
          .map((d) => ({ id: d.id, firstname: d.firstname, lastname: d.lastname }));
      }

      setData({
        employeeCount,
        employeesByStatus,
        newCandidateCount,
        candidatesByStatus,
        pendingLeaveCount,
        upcomingHolidays,
        onLeaveToday,
        onLeaveNext7Days,
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
      {/* Row 1: Key stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {!hideAdminWidgets && <StatCard icon={Users} label='Employees' value={data.loaded ? data.employeeCount : null} valueColor='text-primary' />}
        {!hideAdminWidgets && <StatCard icon={UserRound} label='New Candidates' value={data.loaded ? data.newCandidateCount : null} valueColor='text-sky-600' />}
        <StatCard icon={Clock} label='Leave Approvals Pending' value={data.loaded ? data.pendingLeaveCount : null} valueColor='text-amber-600' />
        <div className='flex h-full items-center rounded-lg border border-border bg-card p-5'>
          <div className='flex w-full items-start gap-4'>
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
              <CalendarDays className='h-7 w-7 text-primary' />
            </div>
            <div className='flex min-w-0 flex-1 flex-col'>
              <span className='mb-2 text-sm font-medium text-muted-foreground'>Upcoming Holidays</span>
              {!data.loaded ? (
                <div className='h-12 animate-pulse rounded bg-muted' />
              ) : data.upcomingHolidays.length > 0 ? (
                <div className='flex flex-col gap-2'>
                  {data.upcomingHolidays.map((h) => (
                    <div key={h.id} className='flex items-start gap-3'>
                      <span className='w-[100px] shrink-0 text-sm text-muted-foreground'>{formatDate(h.date)}</span>
                      <span className='text-sm font-medium'>{h.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No upcoming holidays</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Employee status + Candidate status */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
            <div className='flex w-full items-start gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
                <Users className='h-7 w-7 text-primary' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-2 text-sm font-medium text-muted-foreground'>Employees by Status</span>
                {!data.loaded ? (
                  <div className='h-12 animate-pulse rounded bg-muted' />
                ) : (
                  <div className='flex flex-wrap gap-4'>
                    {Object.values(EmployeeStatusDtoEnum).map((status) => {
                      const info = EMPLOYEE_STATUS_LABELS[status];
                      return (
                        <div key={status} className='flex flex-col'>
                          <span className={`text-2xl font-semibold ${info?.color ?? ''}`}>{data.employeesByStatus[status] ?? 0}</span>
                          <span className='text-xs text-muted-foreground'>{info?.label ?? status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
            <div className='flex w-full items-start gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
                <UserRound className='h-7 w-7 text-primary' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-2 text-sm font-medium text-muted-foreground'>Candidates by Status</span>
                {!data.loaded ? (
                  <div className='h-12 animate-pulse rounded bg-muted' />
                ) : (
                  <div className='flex flex-wrap gap-4'>
                    {Object.values(CandidateStatusDtoEnum).map((status) => {
                      const info = CANDIDATE_STATUS_LABELS[status];
                      return (
                        <div key={status} className='flex flex-col'>
                          <span className={`text-2xl font-semibold ${info?.color ?? ''}`}>{data.candidatesByStatus[status] ?? 0}</span>
                          <span className='text-xs text-muted-foreground'>{info?.label ?? status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: On leave today (calendar style) + Upcoming leaves this week */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <OnLeaveTodayWidget entries={data.onLeaveToday} loaded={data.loaded} />
        <LeavesNext7DaysWidget entries={data.onLeaveNext7Days} loaded={data.loaded} />
      </div>

      {/* Row 4: Anniversaries + No reporting manager */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
            <div className='flex w-full items-start gap-4'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
                <Cake className='h-7 w-7 text-primary' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                <span className='mb-2 text-sm font-medium text-muted-foreground'>Upcoming Work Anniversaries</span>
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
            </div>
          </div>
          <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
            <div className='flex w-full items-start gap-5'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
                <AlertTriangle className='h-7 w-7 text-primary' />
              </div>
              <div className='flex min-w-0 flex-1 flex-col'>
                {!data.loaded ? (
                  <div className='h-9 w-16 animate-pulse rounded bg-muted' />
                ) : (
                  <span className={`text-3xl font-semibold ${data.noReportingManager.length > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{data.noReportingManager.length}</span>
                )}
                <span className='text-sm text-muted-foreground'>No Reporting Manager</span>
                {data.loaded && data.noReportingManager.length > 0 && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {data.noReportingManager.map((e) => `${e.firstname} ${e.lastname}`).join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Row 5: Payroll */}
      {!hideAdminWidgets && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='flex h-full items-center rounded-lg border border-border bg-card p-5'>
            <div className='flex w-full items-start gap-5'>
              <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
                <DollarSign className='h-7 w-7 text-primary' />
              </div>
              {!data.loaded ? (
                <div className='h-9 w-16 animate-pulse rounded bg-muted' />
              ) : (
                <div className='flex flex-col'>
                  <span className='text-3xl font-semibold text-primary'>{data.currencySymbol}{Math.round(data.totalPayrollCost / 12).toLocaleString('en-IN')}</span>
                  <span className='text-sm text-muted-foreground'>Monthly Payroll Cost</span>
                  <span className='text-xs text-muted-foreground'>Yearly: {data.currencySymbol}{data.totalPayrollCost.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
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
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, valueColor }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | null; valueColor?: string }) {
  return (
    <div className='flex h-full items-center rounded-lg border border-border bg-card p-5'>
      <div className='flex w-full items-start gap-5'>
        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
          <Icon className='h-7 w-7 text-primary' />
        </div>
        <div className='flex flex-col'>
          {value === null ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <span className={`text-3xl font-semibold ${valueColor ?? ''}`}>{value.toLocaleString()}</span>
          )}
          <span className='text-sm text-muted-foreground'>{label}</span>
        </div>
      </div>
    </div>
  );
}

function OnLeaveTodayWidget({ entries, loaded }: { entries: LeaveEntry[]; loaded: boolean }) {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = today.getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
      <div className='flex w-full items-start gap-5'>
        {/* Calendar day icon */}
        <div className='flex w-16 shrink-0 flex-col overflow-hidden rounded-lg border border-border text-center'>
          <div className='bg-primary px-2 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{dayName}</div>
          <div className='flex flex-1 flex-col items-center justify-center bg-card py-1'>
            <span className='text-2xl font-bold leading-tight text-foreground'>{dayNum}</span>
            <span className='text-[10px] font-medium text-muted-foreground'>{monthName}</span>
          </div>
        </div>

        {/* Content */}
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='mb-2'>
            <span className='text-sm font-medium text-muted-foreground'>On Leave Today</span>
          </div>
          {!loaded ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : entries.length > 0 ? (
            <div className='flex flex-col gap-1.5'>
              {entries.map((l) => (
                <div key={l.userId} className='flex items-center justify-between gap-4'>
                  <span className='text-sm font-medium'>{l.firstname} {l.lastname}</span>
                  <span className='text-xs text-muted-foreground'>{formatDate(l.startDate)} - {formatDate(l.endDate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No one on leave today</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LeavesNext7DaysWidget({ entries, loaded }: { entries: LeaveEntry[]; loaded: boolean }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);

  const fromDay = tomorrow.getDate();
  const fromMonth = tomorrow.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const toDay = endDate.getDate();
  const toMonth = endDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  return (
    <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
      <div className='flex w-full items-start gap-5'>
        {/* Calendar date range icon */}
        <div className='flex shrink-0 items-center gap-1.5'>
          <div className='flex w-14 flex-col overflow-hidden rounded-lg border border-border text-center'>
            <div className='bg-primary px-1.5 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{fromMonth}</div>
            <div className='flex flex-col items-center justify-center bg-card py-1'>
              <span className='text-xl font-bold leading-tight text-foreground'>{fromDay}</span>
            </div>
          </div>
          <span className='text-xs font-medium text-muted-foreground'>—</span>
          <div className='flex w-14 flex-col overflow-hidden rounded-lg border border-border text-center'>
            <div className='bg-primary px-1.5 py-1 text-[10px] font-bold tracking-wider text-primary-foreground'>{toMonth}</div>
            <div className='flex flex-col items-center justify-center bg-card py-1'>
              <span className='text-xl font-bold leading-tight text-foreground'>{toDay}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex min-w-0 flex-1 flex-col'>
          <div className='mb-2'>
            <span className='text-sm font-medium text-muted-foreground'>Leaves for Next 7 Days</span>
          </div>
          {!loaded ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : entries.length > 0 ? (
            <div className='flex flex-col gap-1.5'>
              {entries.map((l) => (
                <div key={l.userId} className='flex items-center justify-between gap-4'>
                  <span className='text-sm font-medium'>{l.firstname} {l.lastname}</span>
                  <span className='text-xs text-muted-foreground'>{formatDate(l.startDate)} - {formatDate(l.endDate)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No upcoming leaves</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LeaveWidget({ icon: Icon, label, entries, loaded }: { icon: React.ComponentType<{ className?: string }>; label: string; entries: LeaveEntry[]; loaded: boolean }) {
  return (
    <div className='flex h-full items-center rounded-lg border border-border bg-card p-5 lg:col-span-2'>
      <div className='flex w-full items-start gap-4'>
        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
          <Icon className='h-7 w-7 text-primary' />
        </div>
        <div className='flex min-w-0 flex-1 flex-col'>
          <span className='mb-2 text-sm font-medium text-muted-foreground'>{label}</span>
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
      </div>
    </div>
  );
}

function NameListWidget({ icon: Icon, label, entries, loaded, emptyMessage }: { icon: React.ComponentType<{ className?: string }>; label: string; entries: NameEntry[]; loaded: boolean; emptyMessage: string }) {
  return (
    <div className='flex h-full items-center rounded-lg border border-border bg-card p-5'>
      <div className='flex w-full items-start gap-5'>
        <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#f7f8fa]'>
          <Icon className='h-7 w-7 text-primary' />
        </div>
        <div className='flex min-w-0 flex-1 flex-col'>
          {!loaded ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <span className={`text-3xl font-semibold ${entries.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{entries.length}</span>
          )}
          <span className='text-sm text-muted-foreground'>{label}</span>
          {loaded && entries.length > 0 && (
            <p className='mt-2 text-sm text-muted-foreground'>
              {entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
