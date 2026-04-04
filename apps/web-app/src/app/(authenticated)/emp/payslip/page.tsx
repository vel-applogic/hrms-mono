import { redirect } from 'next/navigation';

import { EmployeeViewPayslip } from '@/feature/employee/employee-view-payslip';
import { auth } from '@/lib/auth/auth';
import { searchPayslips } from '@/lib/action/payslip.actions';

export default async function EmpPayslipPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  const initialPage = await searchPayslips({
    pagination: { page: 1, limit: 50 },
    employeeIds: [employeeId],
  }).catch(() => ({ results: [], totalRecords: 0, page: 1, limit: 50 }));

  return (
    <div className='flex h-full flex-col px-4 py-4 md:px-11'>
      <EmployeeViewPayslip employeeId={employeeId} initialPage={initialPage} readOnly />
    </div>
  );
}
