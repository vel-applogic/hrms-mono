import { redirect } from 'next/navigation';

import { OrganizationView } from '@/feature/organization/organization-view';
import { getOrganizationById } from '@/lib/action/organization.actions';
import { auth } from '@/lib/auth/auth';

export default async function OrganizationDocumentsPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/employee');
  }

  const organizationId = session?.user?.organizationId;
  if (!organizationId) {
    redirect('/employee');
  }

  const result = await getOrganizationById(organizationId);
  if (!result.ok) {
    redirect('/employee');
  }

  return (
    <div className='flex h-full flex-col'>
      <OrganizationView organization={result.data} activeTab='documents' />
    </div>
  );
}
