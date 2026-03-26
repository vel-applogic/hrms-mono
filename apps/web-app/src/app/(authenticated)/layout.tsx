import { redirect } from 'next/navigation';

import { MobileNav } from '@/feature/nav/mobile-nav';
import { NavTabs } from '@/feature/nav/nav-tabs';
import { UserMenu } from '@/feature/user/user-menu';
import { auth } from '@/lib/auth/auth';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className='flex h-screen flex-col bg-background'>
      <header className='shrink-0 border-b border-border'>
        <div className='mx-auto max-w-[2200px]'>
          <TopNav
            currentUserName={session.user?.name ?? session.user?.email ?? 'User'}
            currentUserEmail={session.user?.email ?? ''}
          />
        </div>
      </header>
      <main className='min-h-0 w-full flex-1'>{children}</main>
    </div>
  );
}

function TopNav({ currentUserName, currentUserEmail }: { currentUserName: string; currentUserEmail: string }) {
  return (
    <nav className='flex items-center justify-between px-4 py-2 md:px-8 md:py-1'>
      {/* Logo - always visible */}
      <div className='flex items-center gap-3 md:gap-5 md:px-4 md:py-1'>
        <img src='/logo.png' alt='Hrms' width={160} />
        <span className='hidden rounded border border-primary px-1.5 py-0.5 text-sm font-bold tracking-widest text-white sm:inline'>ADMIN</span>
      </div>

      {/* Desktop navigation - hidden on mobile */}
      <NavTabs />

      {/* Desktop right side - hidden on mobile */}
      <div className='hidden lg:block'>
        <UserMenu userName={currentUserName} userEmail={currentUserEmail} />
      </div>

      {/* Mobile hamburger menu - visible only on mobile */}
      <div className='lg:hidden'>
        <MobileNav userName={currentUserName} userEmail={currentUserEmail} />
      </div>
    </nav>
  );
}
