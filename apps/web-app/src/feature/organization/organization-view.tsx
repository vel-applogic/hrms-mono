'use client';

import type { OrganizationDetailResponseType } from '@repo/dto';
import Link from 'next/link';

import { OrganizationViewDocuments } from './organization-view-documents';
import { OrganizationViewInfo } from './organization-view-info';
import { OrganizationViewSettings } from './organization-view-settings';

const TABS = [
  { id: 'info' as const, label: 'Info' },
  { id: 'settings' as const, label: 'Settings' },
  { id: 'documents' as const, label: 'Documents' },
] as const;

interface Props {
  organization: OrganizationDetailResponseType;
  activeTab: 'info' | 'settings' | 'documents';
}

export function OrganizationView({ organization, activeTab }: Props) {
  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-medium tracking-tight text-foreground'>{organization.name}</h1>
        </div>
      </div>

      <div className='center-container flex flex-col gap-4'>
        <div className='flex items-center gap-2.5 border-b border-border'>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link key={tab.id} href={`/organization/${tab.id}`} className='group relative flex h-[52px] items-center px-3 pb-2 pt-3'>
                <span className={`text-sm font-bold tracking-widest transition-colors group-hover:text-foreground ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {tab.label}
                </span>
                {isActive && <span className='absolute bottom-[-1px] left-0 right-0 h-[3px] bg-primary' />}
              </Link>
            );
          })}
        </div>

        <div className='min-h-0 flex-1 p-6'>
          {activeTab === 'info' && <OrganizationViewInfo organizationId={organization.id} />}
          {activeTab === 'settings' && <OrganizationViewSettings organizationId={organization.id} />}
          {activeTab === 'documents' && <OrganizationViewDocuments organizationId={organization.id} />}
        </div>
      </div>
    </div>
  );
}
