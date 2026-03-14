import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployeeIdPage(props: Props) {
  const { id } = await props.params;
  redirect(`/employee/${id}/details`);
}
