'use client';

import type {
  EmployeeBgvFeedbackResponseType,
  EmployeeCompensationResponseType,
  EmployeeDeductionResponseType,
  EmployeeDetailResponseType,
  EmployeeFeedbackResponseType,
  LeaveResponseType,
  PaginatedResponseType,
  PayslipListResponseType,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { PageTabs } from '@repo/ui/component/ui/page-tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { EmployeeViewBasicDetails } from './employee-view-basic-details';
import { EmployeeViewBgv } from './employee-view-bgv';
import { EmployeeViewCompensation } from './employee-view-compensation';
import { EmployeeViewDeduction } from './employee-view-deduction';
import { EmployeeViewDocuments } from './employee-view-documents';
import { EmployeeViewFeedbacks } from './employee-view-feedbacks';
import { EmployeeViewLeave } from './employee-view-leave';
import { EmployeeViewPayslip } from './employee-view-payslip';

interface Props {
  employee: EmployeeDetailResponseType;
  initialFeedbackPage: PaginatedResponseType<EmployeeFeedbackResponseType>;
  initialCompensationPage: PaginatedResponseType<EmployeeCompensationResponseType>;
  initialDeductionPage: PaginatedResponseType<EmployeeDeductionResponseType>;
  initialLeavePage: PaginatedResponseType<LeaveResponseType>;
  initialBgvPage: PaginatedResponseType<EmployeeBgvFeedbackResponseType>;
  initialPayslipPage: PaginatedResponseType<PayslipListResponseType>;
  initialLeaveFinancialYear: string;
  activeTab: 'details' | 'documents' | 'feedbacks' | 'compensation' | 'deduction' | 'leave' | 'payslip' | 'bgv';
}

export function EmployeeView({ employee, initialFeedbackPage, initialCompensationPage, initialDeductionPage, initialLeavePage, initialBgvPage, initialPayslipPage, initialLeaveFinancialYear, activeTab }: Props) {
  const tabs = [
    { id: 'details', label: 'Employee Details', href: `/employee/${employee.id}/details` },
    { id: 'documents', label: 'Documents', href: `/employee/${employee.id}/documents` },
    { id: 'feedbacks', label: 'Feedbacks', href: `/employee/${employee.id}/feedbacks` },
    { id: 'compensation', label: 'Compensation', href: `/employee/${employee.id}/compensation` },
    { id: 'deduction', label: 'Deduction', href: `/employee/${employee.id}/deduction` },
    { id: 'leave', label: 'Leave', href: `/employee/${employee.id}/leave` },
    { id: 'payslip', label: 'Payslip', href: `/employee/${employee.id}/payslip` },
    { id: 'bgv', label: 'BGV', href: `/employee/${employee.id}/bgv` },
  ];

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link href='/employee'>
            <Button variant='ghost' size='icon' className='shrink-0'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          <div>
            <h1 className='text-xl font-medium tracking-tight text-foreground'>
              {employee.firstname} {employee.lastname}
            </h1>
            <p className='text-sm text-muted-foreground'>{employee.email}</p>
          </div>
        </div>
      </div>

      <div className='center-container flex flex-col gap-4'>
        <PageTabs tabs={tabs} activeTabId={activeTab} />

        <div className='min-h-0 flex-1'>
          {activeTab === 'details' && <EmployeeViewBasicDetails employeeId={employee.id} />}
          {activeTab === 'documents' && <EmployeeViewDocuments employeeId={employee.id} />}
          {activeTab === 'feedbacks' && <EmployeeViewFeedbacks employeeId={employee.id} initialPage={initialFeedbackPage} />}
          {activeTab === 'compensation' && <EmployeeViewCompensation employeeId={employee.id} initialPage={initialCompensationPage} />}
          {activeTab === 'deduction' && <EmployeeViewDeduction employeeId={employee.id} initialPage={initialDeductionPage} />}
          {activeTab === 'leave' && <EmployeeViewLeave employeeId={employee.id} initialData={initialLeavePage} initialFinancialYear={initialLeaveFinancialYear} />}
          {activeTab === 'payslip' && <EmployeeViewPayslip employeeId={employee.id} initialPage={initialPayslipPage} />}
          {activeTab === 'bgv' && <EmployeeViewBgv employeeId={employee.id} initialPage={initialBgvPage} />}
        </div>
      </div>
    </div>
  );
}
