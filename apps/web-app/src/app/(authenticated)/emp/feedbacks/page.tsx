import { redirect } from 'next/navigation';

import { EmployeeViewFeedbacks } from '@/feature/employee/employee-view-feedbacks';
import { auth } from '@/lib/auth/auth';
import { searchEmployeeFeedbacks } from '@/lib/action/employee-feedback.actions';

export default async function EmpFeedbacksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const employeeId = Number(session.user.id);

  const initialPage = await searchEmployeeFeedbacks({
    employeeId,
    pagination: { page: 1, limit: 10 },
  }).catch(() => ({ results: [], totalRecords: 0, page: 1, limit: 10 }));

  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
      <div className='center-container flex min-h-0 flex-1 flex-col pb-4'>
        <EmployeeViewFeedbacks employeeId={employeeId} initialPage={initialPage} readOnly />
      </div>
    </div>
  );
}
