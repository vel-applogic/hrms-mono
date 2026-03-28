import { notFound } from 'next/navigation';

import { OrganizationView } from '@/feature/organization/organization-view';
import { getOrganizationById } from '@/lib/action/organization.actions';

const TABS = ['info', 'settings', 'documents'] as const;
type Tab = (typeof TABS)[number];

function isTab(tab: string): tab is Tab {
  return TABS.includes(tab as Tab);
}

interface Props {
  params: Promise<{ id: string; tab: string }>;
}

export default async function OrganizationViewPage(props: Props) {
  const { id, tab } = await props.params;
  const organizationId = parseInt(id, 10);
  if (isNaN(organizationId) || !isTab(tab)) {
    notFound();
  }

  const result = await getOrganizationById(organizationId);

  if (!result.ok) {
    notFound();
  }

  return (
    <div className='flex h-full flex-col'>
      <OrganizationView organization={result.data} activeTab={tab} />
    </div>
  );
}
