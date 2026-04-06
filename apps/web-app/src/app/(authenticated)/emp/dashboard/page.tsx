import { redirect } from 'next/navigation';

import { Dashboard } from '@/feature/dashboard/dashboard';
import { auth } from '@/lib/auth/auth';

export default async function EmpDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  return (
    <div className='h-full'>
      <Dashboard hideAdminWidgets employeeId={employeeId} />
    </div>
  );
}
