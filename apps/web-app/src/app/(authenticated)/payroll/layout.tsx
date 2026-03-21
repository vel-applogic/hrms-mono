import { PayrollView } from '@/feature/payroll/payroll-view';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  return <PayrollView>{children}</PayrollView>;
}
