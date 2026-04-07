import { redirect } from 'next/navigation';

import { Dashboard } from '@/feature/dashboard/dashboard';
import { auth } from '@/lib/auth/auth';

export default async function DashboardPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/emp/dashboard');
  }

  return (
    <div className='h-full'>
      <Dashboard />
    </div>
  );
}
