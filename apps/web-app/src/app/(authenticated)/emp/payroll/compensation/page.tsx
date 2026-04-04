import { redirect } from 'next/navigation';

import { EmployeeViewCompensation } from '@/feature/employee/employee-view-compensation';
import { auth } from '@/lib/auth/auth';
import { searchEmployeeCompensations } from '@/lib/action/employee-compensation.actions';

export default async function EmpPayrollCompensationPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  const initialPage = await searchEmployeeCompensations({
    employeeId,
    pagination: { page: 1, limit: 10 },
  }).catch(() => ({ results: [], totalRecords: 0, page: 1, limit: 10 }));

  return (
    <div className='flex h-full flex-col'>
      <EmployeeViewCompensation employeeId={employeeId} initialPage={initialPage} />
    </div>
  );
}
