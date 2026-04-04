import { redirect } from 'next/navigation';

import { HeaderPageTitle } from '@/feature/nav/header-page-title';
import { MobileNav } from '@/feature/nav/mobile-nav';
import { SidebarNav } from '@/feature/nav/sidebar-nav';
import { HeaderProfile } from '@/feature/user/header-profile';
import { auth } from '@/lib/auth/auth';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const currentUserName = session.user?.name ?? session.user?.email ?? 'User';
  const currentUserEmail = session.user?.email ?? '';
  const isAdmin = session.user?.roles?.includes('admin') ?? false;
  const roleBadgeLabel = session.user?.isSuperAdmin ? 'SU' : isAdmin ? 'ADMIN' : null;

  return (
    <div className='flex h-screen flex-col overflow-hidden bg-background'>
      {/* Role badge strip */}
      {roleBadgeLabel && (
        <div className='relative flex h-1 w-full shrink-0 bg-primary'>
          <span className='absolute right-2 top-0 z-20 rounded-b px-2 py-0.5 text-[10px] font-bold tracking-widest text-primary-foreground bg-primary'>{roleBadgeLabel}</span>
        </div>
      )}

      <div className='flex min-h-0 flex-1'>
        {/* Fixed left sidebar - desktop only */}
        <aside className='relative z-10 hidden w-60 shrink-0 flex-col bg-white shadow-[2px_0_8px_rgba(0,0,0,0.06)] lg:flex'>
          {/* Logo */}
          <div className='flex h-16 items-center gap-3 border-b border-[--color-sidebar-border] px-5 mb-3'>
            <div className='p-2'>
              <img src='/logo.png' alt='Hrms' width={130} />
            </div>
          </div>

          {/* Navigation */}
          <SidebarNav isSuperAdmin={session.user?.isSuperAdmin} isAdmin={isAdmin} />
        </aside>

        {/* Main content area */}
        <div className='flex min-w-0 flex-1 flex-col'>
          {/* Desktop header */}
          <header className='hidden shrink-0 bg-[#077f8c14] lg:block'>
            <div className='flex h-16 items-center justify-between gap-4 px-6'>
              <HeaderPageTitle />
              <HeaderProfile userName={currentUserName} userEmail={currentUserEmail} />
            </div>
          </header>

          {/* Mobile header - visible only below lg */}
          <header className='shrink-0 border-b border-border bg-card lg:hidden'>
            <nav className='flex items-center justify-between px-4 py-2'>
              <div className='flex items-center gap-3'>
                <img src='/logo.png' alt='Hrms' width={130} />
                {roleBadgeLabel && (
                  <span className='hidden rounded bg-primary px-1.5 py-0.5 text-xs font-bold tracking-widest text-primary-foreground sm:inline'>{roleBadgeLabel}</span>
                )}
              </div>
              <MobileNav userName={currentUserName} userEmail={currentUserEmail} isSuperAdmin={session.user?.isSuperAdmin} isAdmin={isAdmin} />
            </nav>
          </header>

          {/* Page content - full width */}
          <main className='min-h-0 w-full flex-1 overflow-y-auto px-6 py-6'>{children}</main>
        </div>
      </div>
    </div>
  );
}
