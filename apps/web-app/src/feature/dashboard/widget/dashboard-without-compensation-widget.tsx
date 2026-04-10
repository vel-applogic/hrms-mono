'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { FileWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';
import { searchPayrollActiveCompensations } from '@/lib/action/employee-compensation.actions';

type NameEntry = { id: number; firstname: string; lastname: string };

export function DashboardWithoutCompensation() {
  const [entries, setEntries] = useState<NameEntry[] | null>(null);

  useEffect(() => {
    Promise.all([getEmployeesList(), searchPayrollActiveCompensations({ pagination: { page: 1, limit: 500 } })]).then(([employees, compensations]) => {
      const active = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      const idsWithComp = new Set(compensations.results.map((c) => c.employeeId));
      setEntries(active.filter((e) => !idsWithComp.has(e.id)).map((e) => ({ id: e.id, firstname: e.firstname, lastname: e.lastname })));
    });
  }, []);

  return (
    <Widget label='Without Compensation' icon={FileWarning}>
      <WidgetInnerSingleCounter
        value={entries?.length ?? 0}
        valueColor={entries && entries.length > 0 ? 'text-amber-600' : 'text-emerald-600'}
        caption={entries ? entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ') : undefined}
      />
    </Widget>
  );
}
