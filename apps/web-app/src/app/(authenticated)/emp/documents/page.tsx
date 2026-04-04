import { redirect } from 'next/navigation';

import { EmployeeViewDocuments } from '@/feature/employee/employee-view-documents';
import { auth } from '@/lib/auth/auth';

export default async function EmpDocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  return (
    <div className='flex h-full flex-col px-4 py-4 md:px-11'>
      <EmployeeViewDocuments employeeId={employeeId} />
    </div>
  );
}
