'use client';

import type { OrganisationDetailResponseType } from '@repo/dto';
import { PageTabs } from '@repo/ui/component/ui/page-tabs';

import { OrganisationViewDocuments } from './organisation-view-documents';
import { OrganisationViewInfo } from './organisation-view-info';
import { OrganisationViewSettings } from './organisation-view-settings';

const TABS = [
  { id: 'info', label: 'Info', href: '/organisation/info' },
  { id: 'settings', label: 'Settings', href: '/organisation/settings' },
  { id: 'documents', label: 'Documents', href: '/organisation/documents' },
];

interface Props {
  organisation: OrganisationDetailResponseType;
  activeTab: 'info' | 'settings' | 'documents';
}

export function OrganisationView({ organisation, activeTab }: Props) {
  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-medium tracking-tight text-foreground'>{organisation.name}</h1>
        </div>
      </div>

      <div className='center-container flex flex-col gap-4'>
        <PageTabs tabs={TABS} activeTabId={activeTab} />

        <div className='min-h-0 flex-1 p-6'>
          {activeTab === 'info' && <OrganisationViewInfo organisationId={organisation.id} />}
          {activeTab === 'settings' && <OrganisationViewSettings organisationId={organisation.id} />}
          {activeTab === 'documents' && <OrganisationViewDocuments organisationId={organisation.id} />}
        </div>
      </div>
    </div>
  );
}
