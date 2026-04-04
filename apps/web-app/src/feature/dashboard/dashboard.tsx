'use client';

import type { HolidayResponseType } from '@repo/dto';
import { CandidateStatusDtoEnum, LeaveStatusDtoEnum } from '@repo/dto';
import { CalendarDays, Clock, UserCheck, UserRound, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { getCandidatesList } from '@/lib/action/candidate.actions';
import { getEmployeesList } from '@/lib/action/employee.actions';
import { searchHolidays } from '@/lib/action/holiday.actions';
import { searchLeaves } from '@/lib/action/leave.actions';

type LeaveEntry = { userId: number; firstname: string; lastname: string; startDate: string; endDate: string };

interface DashboardData {
  employeeCount: number;
  newCandidateCount: number;
  pendingLeaveCount: number;
  upcomingHolidays: HolidayResponseType[];
  onLeaveToday: LeaveEntry[];
  onLeaveTomorrow: LeaveEntry[];
  loaded: boolean;
}

export function Dashboard() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id ? Number(session.user.id) : null;

  const [data, setData] = useState<DashboardData>({
    employeeCount: 0,
    newCandidateCount: 0,
    pendingLeaveCount: 0,
    upcomingHolidays: [],
    onLeaveToday: [],
    onLeaveTomorrow: [],
    loaded: false,
  });

  useEffect(() => {
    if (!currentUserId) return;

    const fetchData = async () => {
      const [employees, candidates, holidays, pendingLeaves, approvedLeaves] = await Promise.all([
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
      ]);

      const newCandidateCount = candidates.filter((c) => c.status === CandidateStatusDtoEnum.new).length;
      const pendingLeaveCount = pendingLeaves.totalRecords;

      const today = new Date().toISOString().split('T')[0]!;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0]!;

      const mapLeave = (l: (typeof approvedLeaves.results)[number]): LeaveEntry => ({
        userId: l.userId,
        firstname: l.user.firstname,
        lastname: l.user.lastname,
        startDate: l.startDate,
        endDate: l.endDate,
      });

      const onLeaveToday = approvedLeaves.results
        .filter((l) => l.startDate <= today && l.endDate >= today)
        .map(mapLeave);

      const onLeaveTomorrow = approvedLeaves.results
        .filter((l) => l.startDate <= tomorrowStr && l.endDate >= tomorrowStr)
        .map(mapLeave);

      // Filter upcoming holidays (today or future), sort by date, take first 2
      const upcomingHolidays = holidays.results
        .filter((h) => h.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 2);

      setData({
        employeeCount: employees.length,
        newCandidateCount,
        pendingLeaveCount,
        upcomingHolidays,
        onLeaveToday,
        onLeaveTomorrow,
        loaded: true,
      });
    };

    fetchData();
  }, [currentUserId]);

  return (
    <div className='flex flex-col gap-6'>
      <h1 className='text-xl font-medium tracking-tight'>Dashboard</h1>

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
                  <span className='text-sm text-muted-foreground'>{formatHolidayDate(h.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>No upcoming holidays</p>
          )}
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <UserCheck className='h-5 w-5' />
            <span className='text-sm font-medium'>On Leave Today</span>
          </div>
          {!data.loaded ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex items-start gap-6'>
              <p className='text-3xl font-semibold'>{data.onLeaveToday.length}</p>
              {data.onLeaveToday.length > 0 && (
                <div className='flex flex-col gap-2'>
                  {data.onLeaveToday.map((l) => (
                    <div key={l.userId} className='flex items-center justify-between gap-4'>
                      <span className='text-sm font-medium'>{l.firstname} {l.lastname}</span>
                      <span className='text-xs text-muted-foreground'>{formatHolidayDate(l.startDate)} - {formatHolidayDate(l.endDate)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className='rounded-lg border border-border bg-card p-5 lg:col-span-2'>
          <div className='mb-3 flex items-center gap-2 text-muted-foreground'>
            <UserCheck className='h-5 w-5' />
            <span className='text-sm font-medium'>On Leave Tomorrow</span>
          </div>
          {!data.loaded ? (
            <div className='h-9 w-16 animate-pulse rounded bg-muted' />
          ) : (
            <div className='flex items-start gap-6'>
              <p className='text-3xl font-semibold'>{data.onLeaveTomorrow.length}</p>
              {data.onLeaveTomorrow.length > 0 && (
                <div className='flex flex-col gap-2'>
                  {data.onLeaveTomorrow.map((l) => (
                    <div key={l.userId} className='flex items-center justify-between gap-4'>
                      <span className='text-sm font-medium'>{l.firstname} {l.lastname}</span>
                      <span className='text-xs text-muted-foreground'>{formatHolidayDate(l.startDate)} - {formatHolidayDate(l.endDate)}</span>
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

function formatHolidayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
