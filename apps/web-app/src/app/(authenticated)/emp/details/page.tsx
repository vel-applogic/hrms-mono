import { redirect } from 'next/navigation';

import { EmployeeViewBasicDetails } from '@/feature/employee/employee-view-basic-details';
import { auth } from '@/lib/auth/auth';

export default async function EmpDetailsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  return (
    <div className='flex h-full flex-col px-4 py-4 md:px-11'>
      <EmployeeViewBasicDetails employeeId={employeeId} readOnly />
    </div>
  );
}
