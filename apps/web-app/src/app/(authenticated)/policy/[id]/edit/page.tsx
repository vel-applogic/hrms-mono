import { notFound } from 'next/navigation';

import { PolicyEditPage } from '@/feature/policy/policy-edit-page';
import { getPolicyById } from '@/lib/action/policy.actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PolicyEditRoute(props: Props) {
  const { id } = await props.params;
  const policyId = parseInt(id, 10);
  if (isNaN(policyId)) notFound();

  const policy = await getPolicyById(policyId).catch(() => null);
  if (!policy) notFound();

  return <PolicyEditPage policy={policy} backHref='/policy' />;
}
