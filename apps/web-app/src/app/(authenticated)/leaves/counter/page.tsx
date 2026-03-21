import { redirect } from 'next/navigation';

export default function LeaveCounterRedirectPage() {
  redirect('/leaves');
}
