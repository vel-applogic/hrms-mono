import { Dashboard } from '@/feature/dashboard/dashboard';

export default function EmpDashboardPage() {
  return (
    <div className='h-full'>
      <Dashboard hideAdminWidgets />
    </div>
  );
}
