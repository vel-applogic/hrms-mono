import { redirect } from 'next/navigation';

import { EmpPayslipData } from '@/feature/emp/emp-payslip-data';
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
    <div className='flex h-full flex-col'>
      <EmpPayslipData employeeId={employeeId} initialPage={initialPage} />
    </div>
  );
}
