import { EmpPayrollView } from '@/feature/emp/emp-payroll-view';

export default function EmpPayrollLayout({ children }: { children: React.ReactNode }) {
  return <EmpPayrollView>{children}</EmpPayrollView>;
}
