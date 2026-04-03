import { LeaveView } from '@/feature/leave/leave-view';

export default function LeavesLayout({ children }: { children: React.ReactNode }) {
  return <LeaveView>{children}</LeaveView>;
}
