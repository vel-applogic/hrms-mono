'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { FileWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';
import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';

type NameEntry = { id: number; firstname: string; lastname: string };

export function DashboardWithoutDeduction() {
  const [entries, setEntries] = useState<NameEntry[] | null>(null);

  useEffect(() => {
    getEmployeesList().then(async (employees) => {
      const active = employees.filter((e) => e.status === EmployeeStatusDtoEnum.active);
      const checks = await Promise.all(
        active.map(async (e) => {
          const result = await searchEmployeeDeductions({ employeeId: e.id, pagination: { page: 1, limit: 1 } });
          return { id: e.id, firstname: e.firstname, lastname: e.lastname, has: result.totalRecords > 0 };
        }),
      );
      setEntries(checks.filter((d) => !d.has).map((d) => ({ id: d.id, firstname: d.firstname, lastname: d.lastname })));
    });
  }, []);

  return (
    <Widget label='Without Deduction' icon={FileWarning}>
      <WidgetInnerSingleCounter
        value={entries?.length ?? 0}
        valueColor={entries && entries.length > 0 ? 'text-amber-600' : 'text-emerald-600'}
        caption={entries ? entries.map((e) => `${e.firstname} ${e.lastname}`).join(', ') : undefined}
      />
    </Widget>
  );
}
