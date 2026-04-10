'use client';

import { EmployeeStatusDtoEnum } from '@repo/dto';
import { Widget, WidgetInnerSingleCounter } from '@repo/ui/component/ui/dashboard-widget';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getEmployeesList } from '@/lib/action/employee.actions';

export function DashboardEmployeeCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getEmployeesList().then((employees) => {
      setCount(employees.filter((e) => e.status === EmployeeStatusDtoEnum.active).length);
    });
  }, []);

  return (
    <Widget label='Employees' icon={Users} href='/employee'>
      <WidgetInnerSingleCounter value={count} valueColor='text-primary' />
    </Widget>
  );
}
