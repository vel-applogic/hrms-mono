import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className='flex items-center gap-1.5 text-sm text-muted-foreground'>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className='flex items-center gap-1.5'>
            {index > 0 && <ChevronRight className='h-3.5 w-3.5 shrink-0' color='#55FDD9' />}
            {isLast || !item.href ? (
              <span className={isLast ? undefined : 'text-white'}>{item.label}</span>
            ) : (
              <Link href={item.href} className='text-white transition-colors hover:text-muted-foreground'>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
