'use client';

import type {
  EmployeeBgvFeedbackResponseType,
  EmployeeCompensationResponseType,
  EmployeeDeductionResponseType,
  EmployeeDetailResponseType,
  EmployeeFeedbackResponseType,
  LeaveResponseType,
  PaginatedResponseType,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { EmployeeViewBasicDetails } from './employee-view-basic-details';
import { EmployeeViewCompensation } from './employee-view-compensation';
import { EmployeeViewDeduction } from './employee-view-deduction';
import { EmployeeViewDocuments } from './employee-view-documents';
import { EmployeeViewFeedbacks } from './employee-view-feedbacks';
import { EmployeeViewLeave } from './employee-view-leave';
import { EmployeeViewBgv } from './employee-view-bgv';

const TABS = [
  { id: 'details' as const, label: 'Employee Details' },
  { id: 'documents' as const, label: 'Documents' },
  { id: 'feedbacks' as const, label: 'Feedbacks' },
  { id: 'compensation' as const, label: 'Compensation' },
  { id: 'deduction' as const, label: 'Deduction' },
  { id: 'leave' as const, label: 'Leave' },
  { id: 'bgv' as const, label: 'BGV' },
] as const;

interface Props {
  employee: EmployeeDetailResponseType;
  initialFeedbackPage: PaginatedResponseType<EmployeeFeedbackResponseType>;
  initialCompensationPage: PaginatedResponseType<EmployeeCompensationResponseType>;
  initialDeductionPage: PaginatedResponseType<EmployeeDeductionResponseType>;
  initialLeavePage: PaginatedResponseType<LeaveResponseType>;
  initialBgvPage: PaginatedResponseType<EmployeeBgvFeedbackResponseType>;
  initialLeaveFinancialYear: string;
  activeTab: 'details' | 'documents' | 'feedbacks' | 'compensation' | 'deduction' | 'leave' | 'bgv';
}

export function EmployeeView({ employee, initialFeedbackPage, initialCompensationPage, initialDeductionPage, initialLeavePage, initialBgvPage, initialLeaveFinancialYear, activeTab }: Props) {
  return (
    <div className='flex h-full flex-col gap-4 pt-4'>
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
        <div className='flex items-center gap-2.5 border-b border-border'>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link key={tab.id} href={`/employee/${employee.id}/${tab.id}`} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
                <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
                {isActive && <span className='absolute -bottom-px left-0 right-0 h-[3px] bg-primary' />}
              </Link>
            );
          })}
        </div>

        <div className='min-h-0 flex-1 pt-4'>
          {activeTab === 'details' && <EmployeeViewBasicDetails employeeId={employee.id} />}
          {activeTab === 'documents' && <EmployeeViewDocuments employeeId={employee.id} />}
          {activeTab === 'feedbacks' && <EmployeeViewFeedbacks employeeId={employee.id} initialPage={initialFeedbackPage} />}
          {activeTab === 'compensation' && <EmployeeViewCompensation employeeId={employee.id} initialPage={initialCompensationPage} />}
          {activeTab === 'deduction' && <EmployeeViewDeduction employeeId={employee.id} initialPage={initialDeductionPage} />}
          {activeTab === 'leave' && <EmployeeViewLeave employeeId={employee.id} initialData={initialLeavePage} initialFinancialYear={initialLeaveFinancialYear} />}
          {activeTab === 'bgv' && <EmployeeViewBgv employeeId={employee.id} initialPage={initialBgvPage} />}
        </div>
      </div>
    </div>
  );
}
