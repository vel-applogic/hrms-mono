import { redirect } from 'next/navigation';

import { MobileNav } from '@/feature/nav/mobile-nav';
import { SidebarNav } from '@/feature/nav/sidebar-nav';
import { UserMenu } from '@/feature/user/user-menu';
import { auth } from '@/lib/auth/auth';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  const currentUserName = session.user?.name ?? session.user?.email ?? 'User';
  const currentUserEmail = session.user?.email ?? '';

  return (
    <div className='flex h-screen bg-background'>
      {/* Fixed left sidebar - desktop only */}
      <aside className='hidden w-60 shrink-0 flex-col border-r border-border lg:flex'>
        {/* Logo */}
        <div className='flex items-center gap-3 border-b border-border px-5 py-4'>
          <img src='/logo.png' alt='Hrms' width={130} />
          <span className='rounded bg-primary px-1.5 py-0.5 text-xs font-bold tracking-widest text-primary-foreground'>ADMIN</span>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* User menu at bottom */}
        <div className='border-t border-border p-3'>
          <UserMenu userName={currentUserName} userEmail={currentUserEmail} />
        </div>
      </aside>

      {/* Main content area */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {/* Mobile header - visible only below lg */}
        <header className='shrink-0 border-b border-border lg:hidden'>
          <nav className='flex items-center justify-between px-4 py-2'>
            <div className='flex items-center gap-3'>
              <img src='/logo.png' alt='Hrms' width={130} />
              <span className='hidden rounded bg-primary px-1.5 py-0.5 text-xs font-bold tracking-widest text-primary-foreground sm:inline'>ADMIN</span>
            </div>
            <MobileNav userName={currentUserName} userEmail={currentUserEmail} />
          </nav>
        </header>

        {/* Page content - full width */}
        <main className='min-h-0 w-full flex-1'>{children}</main>
      </div>
    </div>
  );
}
