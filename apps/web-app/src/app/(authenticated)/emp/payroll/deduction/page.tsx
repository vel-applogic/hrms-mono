import { redirect } from 'next/navigation';

import { EmployeeViewDeduction } from '@/feature/employee/employee-view-deduction';
import { auth } from '@/lib/auth/auth';
import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';

export default async function EmpPayrollDeductionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  const initialPage = await searchEmployeeDeductions({
    employeeId,
    pagination: { page: 1, limit: 10 },
  }).catch(() => ({ results: [], totalRecords: 0, page: 1, limit: 10 }));

  return (
    <div className='flex h-full flex-col'>
      <EmployeeViewDeduction employeeId={employeeId} initialPage={initialPage} readOnly />
    </div>
  );
}
