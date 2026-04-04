import { notFound } from 'next/navigation';

import { PolicyViewPage } from '@/feature/policy/policy-view-page';
import { getPolicyById } from '@/lib/action/policy.actions';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PolicyViewRoute(props: Props) {
  const { id } = await props.params;
  const policyId = parseInt(id, 10);
  if (isNaN(policyId)) notFound();

  const policy = await getPolicyById(policyId).catch(() => null);
  if (!policy) notFound();

  return <PolicyViewPage policy={policy} backHref='/policy' />;
}
