import { notFound } from 'next/navigation';
import { getFinancialYearCode } from '@repo/shared';

import { EmployeeView } from '@/feature/employee/employee-view';
import { getEmployeeById } from '@/lib/action/employee.actions';
import { searchEmployeeFeedbacks } from '@/lib/action/employee-feedback.actions';
import { searchEmployeeCompensations } from '@/lib/action/employee-compensation.actions';
import { searchEmployeeDeductions } from '@/lib/action/employee-deduction.actions';
import { searchLeaves } from '@/lib/action/leave.actions';

const TABS = ['details', 'documents', 'feedbacks', 'compensation', 'deduction', 'leave'] as const;
type Tab = (typeof TABS)[number];

function isTab(tab: string): tab is Tab {
  return TABS.includes(tab as Tab);
}

interface Props {
  params: Promise<{ id: string; tab: string }>;
}

export default async function EmployeeViewPage(props: Props) {
  const { id, tab } = await props.params;
  const employeeId = parseInt(id, 10);
  if (isNaN(employeeId) || !isTab(tab)) {
    notFound();
  }

  const defaultFinancialYear = getFinancialYearCode(new Date());

  const [employee, feedbackPage, compensationPage, deductionPage, leavePage] = await Promise.all([
    getEmployeeById(employeeId),
    searchEmployeeFeedbacks({ employeeId, pagination: { page: 1, limit: 10 } }),
    searchEmployeeCompensations({ employeeId, pagination: { page: 1, limit: 10 } }),
    searchEmployeeDeductions({ employeeId, pagination: { page: 1, limit: 10 } }),
    searchLeaves({
      pagination: { page: 1, limit: 50 },
      userId: [employeeId],
      financialYear: defaultFinancialYear,
    }),
  ]).catch(() => [null, null, null, null, null]);

  if (!employee) {
    notFound();
  }

  return (
    <div className='flex h-full flex-col'>
      <EmployeeView
        employee={employee}
        initialFeedbackPage={feedbackPage ?? { results: [], totalRecords: 0, page: 1, limit: 10 }}
        initialCompensationPage={compensationPage ?? { results: [], totalRecords: 0, page: 1, limit: 10 }}
        initialDeductionPage={deductionPage ?? { results: [], totalRecords: 0, page: 1, limit: 10 }}
        initialLeavePage={leavePage ?? { results: [], totalRecords: 0, page: 1, limit: 50 }}
        initialLeaveFinancialYear={defaultFinancialYear}
        activeTab={tab}
      />
    </div>
  );
}
