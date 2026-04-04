import { redirect } from 'next/navigation';

import { MobileNav } from '@/feature/nav/mobile-nav';
import { SidebarNav } from '@/feature/nav/sidebar-nav';
import { HeaderPageTitle } from '@/feature/nav/header-page-title';
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
    <div className='flex h-screen overflow-hidden bg-background'>
      {/* Fixed left sidebar - desktop only */}
      <aside className='relative z-10 hidden w-60 shrink-0 flex-col bg-white shadow-[2px_0_8px_rgba(0,0,0,0.06)] lg:flex'>
        {/* Logo */}
        <div className='flex h-16 items-center gap-3 border-b border-[--color-sidebar-border] px-5 relative mb-3'>
          <div className='p-2'>
            <img src='/logo.png' alt='Hrms' width={130} />
          </div>
          {roleBadgeLabel && <span className='rounded-b px-1.5 py-0.5 text-xs font-bold tracking-widest text-primary-foreground bg-primary absolute bottom-[-20px] right-3'>{roleBadgeLabel}</span>}
        </div>

        {/* Navigation */}
        <SidebarNav isSuperAdmin={session.user?.isSuperAdmin} isAdmin={isAdmin} />
      </aside>

      {/* Main content area */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Desktop header */}
        <header className='hidden shrink-0 bg-background lg:block'>
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
              {roleBadgeLabel && <span className='hidden rounded bg-primary px-1.5 py-0.5 text-xs font-bold tracking-widest text-primary-foreground sm:inline'>{roleBadgeLabel}</span>}
            </div>
            <MobileNav userName={currentUserName} userEmail={currentUserEmail} isSuperAdmin={session.user?.isSuperAdmin} isAdmin={isAdmin} />
          </nav>
        </header>

        {/* Page content - full width */}
        <main className='min-h-0 w-full flex-1 overflow-y-auto'>{children}</main>
      </div>
    </div>
  );
}
