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
  { id: 'profile', label: 'Update Profile' },
  { id: 'password', label: 'Change Password' },
] as const;

export default async function ProfilePage(props: Props) {
  const session = await auth();
  if (!session) {
    redirect('/auth/login');
  }

  const rawParams = await props.searchParams;
  const { tab } = SearchParamsSchema.parse(rawParams);

  const profile = await accountService.getProfile();

  return (
    <div className="center-container flex h-full flex-col py-8 px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="flex flex-col gap-6">
        <ProfileTabs activeTab={tab} />

        <div className="rounded-lg border border-border bg-card p-6 md:p-8">
          {tab === 'profile' && (
            <UpdateProfileForm
              initialFirstname={profile.firstname}
              initialLastname={profile.lastname}
              email={profile.email}
            />
          )}
          {tab === 'password' && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}

function ProfileTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={`/profile?tab=${tab.id}`}
          className={[
            'rounded-md px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-white',
          ].join(' ')}
        >
          {tab.label}
        </a>
      ))}
    </div>
  );
}
