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
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex flex-1 flex-col gap-4'>
        <div className='flex items-center gap-2.5 border-b border-border'>
          {tabs.map((t) => {
            const isActive = tab === t.id;
            return (
              <a key={t.id} href={`/profile?tab=${t.id}`} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
                <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {t.label}
                </span>
                {isActive && <span className='absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary' />}
              </a>
            );
          })}
        </div>

        <div className='rounded-lg border border-border bg-card p-6 md:p-8'>
          {tab === 'profile' && <UpdateProfileForm initialFirstname={profile.firstname} initialLastname={profile.lastname} email={profile.email} />}
          {tab === 'password' && <ChangePasswordForm />}
        </div>
      </div>
    </div>
  );
}
