'use client';

import type { OrganizationDetailResponseType } from '@repo/dto';
import { PageTabs } from '@repo/ui/component/ui/page-tabs';

import { OrganizationViewDocuments } from './organization-view-documents';
import { OrganizationViewInfo } from './organization-view-info';
import { OrganizationViewSettings } from './organization-view-settings';

const TABS = [
  { id: 'info', label: 'Info', href: '/organization/info' },
  { id: 'settings', label: 'Settings', href: '/organization/settings' },
  { id: 'documents', label: 'Documents', href: '/organization/documents' },
];

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
        <PageTabs tabs={TABS} activeTabId={activeTab} />

        <div className='min-h-0 flex-1 p-6'>
          {activeTab === 'info' && <OrganizationViewInfo organizationId={organization.id} />}
          {activeTab === 'settings' && <OrganizationViewSettings organizationId={organization.id} />}
          {activeTab === 'documents' && <OrganizationViewDocuments organizationId={organization.id} />}
        </div>
      </div>
    </div>
  );
}
