import { PageTabs } from '@repo/ui/component/ui/page-tabs';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

import { auth } from '@/lib/auth/auth';

const tabs = [
  { id: 'update', label: 'Update Profile', href: '/profile/update' },
  { id: 'change-password', label: 'Change Password', href: '/profile/change-password' },
];

interface Props {
  children: ReactNode;
}

export default async function ProfileLayout({ children }: Props) {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex flex-1 flex-col gap-4'>
        <PageTabs tabs={tabs} />

        <div className='rounded-lg border border-border bg-card p-6 md:p-8'>{children}</div>
      </div>
    </div>
  );
}
