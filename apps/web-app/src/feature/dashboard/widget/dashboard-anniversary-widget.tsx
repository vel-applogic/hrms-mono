'use client';

import type { EmployeeListResponseType } from '@repo/dto';
import { EmployeeStatusDtoEnum } from '@repo/dto';
import { Widget, WidgetInnerLabelValueList } from '@repo/ui/component/ui/dashboard-widget';
import { Cake } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';

type AnniversaryEntry = { id: number; firstname: string; lastname: string; dateOfJoining: string; years: number };

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getUpcomingAnniversaries(employees: EmployeeListResponseType[]): AnniversaryEntry[] {
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

export function DashboardAnniversary() {
  const [anniversaries, setAnniversaries] = useState<AnniversaryEntry[] | null>(null);

  useEffect(() => {
    getEmployeesList().then((employees) => {
      setAnniversaries(getUpcomingAnniversaries(employees));
    });
  }, []);

  return (
    <Widget label='Upcoming Work Anniversaries' icon={Cake} colSpan={2}>
      <WidgetInnerLabelValueList
        items={
          anniversaries
            ? anniversaries.map((e) => ({ label: `${e.firstname} ${e.lastname}`, value: `${formatDate(e.dateOfJoining)} &middot; ${e.years} ${e.years === 1 ? 'year' : 'years'}` }))
            : null
        }
        noRecordMessage='No upcoming anniversaries in the next 30 days'
      />
    </Widget>
  );
}
