import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CandidateIdPage(props: Props) {
  const { id } = await props.params;
  redirect(`/candidate/${id}/basic`);
}
