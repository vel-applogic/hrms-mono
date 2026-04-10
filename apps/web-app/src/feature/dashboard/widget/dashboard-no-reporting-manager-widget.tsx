'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';

type NameEntry = { id: number; firstname: string; lastname: string };

export function DashboardNoReportingManager() {
  const [entries, setEntries] = useState<NameEntry[] | null>(null);

  useEffect(() => {
    getEmployeesList().then((employees) => {
      const active = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      setEntries(active.filter((e) => !e.reportToId).map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname })));
    });
  }, []);

  return (
    <Widget label='No Reporting Manager' icon={AlertTriangle} colSpan={2}>
      <WidgetInnerSingleCounter
        value={entries?.length ?? 0}
        valueColor={entries && entries.length > 0 ? 'text-amber-600' : 'text-emerald-600'}
        caption={entries ? entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ') : undefined}
      />
    </Widget>
  );
}
