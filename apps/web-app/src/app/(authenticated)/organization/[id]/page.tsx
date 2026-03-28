import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationIdPage(props: Props) {
  const { id } = await props.params;
  redirect(`/organization/${id}/info`);
}
