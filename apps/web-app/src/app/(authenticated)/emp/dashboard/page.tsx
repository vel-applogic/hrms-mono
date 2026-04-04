import { Dashboard } from '@/feature/dashboard/dashboard';

export default function EmpDashboardPage() {
  return (
    <div className='h-full px-4 py-4 md:px-11'>
      <Dashboard hideAdminWidgets />
    </div>
  );
}
