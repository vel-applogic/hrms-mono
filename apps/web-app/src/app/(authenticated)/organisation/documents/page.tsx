import { redirect } from 'next/navigation';

import { OrganisationView } from '@/feature/organisation/organisation-view';
import { getOrganisationById } from '@/lib/action/organisation.actions';
import { auth } from '@/lib/auth/auth';

export default async function OrganisationDocumentsPage() {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/employee');
  }

  const organisationId = session?.user?.organisationId;
  if (!organisationId) {
    redirect('/employee');
  }

  const result = await getOrganisationById(organisationId);
  if (!result.ok) {
    redirect('/employee');
  }

  return (
    <div className='flex h-full flex-col'>
      <OrganisationView organisation={result.data} activeTab='documents' />
    </div>
  );
}
