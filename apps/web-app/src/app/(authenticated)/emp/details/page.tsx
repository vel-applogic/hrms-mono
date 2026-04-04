import { redirect } from 'next/navigation';

import { EmployeeViewBasicDetails } from '@/feature/employee/employee-view-basic-details';
import { auth } from '@/lib/auth/auth';

export default async function EmpDetailsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex min-h-0 flex-1 flex-col pb-4'>
        <EmployeeViewBasicDetails employeeId={employeeId} readOnly />
      </div>
    </div>
  );
}
