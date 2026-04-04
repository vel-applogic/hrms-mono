import { PageTabs } from '@repo/ui/component/ui/page-tabs';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { ChangePasswordForm } from '@/feature/account/change-password-form';
import { UpdateProfileForm } from '@/feature/account/update-profile-form';
import { auth } from '@/lib/auth/auth';
import { accountService } from '@/lib/service/account.service';

const SearchParamsSchema = z.object({
  tab: z.enum(['profile', 'password']).default('profile'),
});

interface Props {
  searchParams: Promise<{ tab?: string }>;
}

const tabs = [
  { id: 'profile', label: 'Update Profile', href: '/profile?tab=profile' },
  { id: 'password', label: 'Change Password', href: '/profile?tab=password' },
];

export default async function ProfilePage(props: Props) {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const rawParams = await props.searchParams;
  const { tab } = SearchParamsSchema.parse(rawParams);

  const profile = await accountService.getProfile();

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex flex-1 flex-col gap-4'>
        <PageTabs tabs={tabs} activeTabId={tab} />

        <div className='rounded-lg border border-border bg-card p-6 md:p-8'>
          {tab === 'profile' && <UpdateProfileForm initialFirstname={profile.firstname} initialLastname={profile.lastname} email={profile.email} />}
          {tab === 'password' && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}
