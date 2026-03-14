'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'USERS', href: '/user' },
  { label: 'CHAPTERS', href: '/chapter' },
  { label: 'TOPICS', href: '/topic' },
  { label: 'SLIDES', href: '/slide' },
  { label: 'THEMES', href: '/theme' },
  { label: 'QUESTIONS', href: '/question' },
  { label: 'FLASHCARDS', href: '/flashcard' },
  { label: 'CANDIDATES', href: '/candidate' },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className='hidden h-[52px] items-center gap-2.5 lg:flex'>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
            <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-white ${isActive ? 'text-white' : 'text-muted-foreground'}`}>{tab.label}</span>
            {isActive && <span className='absolute bottom-[-5px] left-0 right-0 h-[3px] bg-primary' />}
          </Link>
        );
      })}
    </div>
  );
}
