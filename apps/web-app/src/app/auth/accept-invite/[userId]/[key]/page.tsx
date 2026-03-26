import { AcceptInviteForm } from '@/feature/auth/accept-invite-form';

interface AcceptInvitePageProps {
  params: Promise<{ userId: string; key: string }>;
}

export default async function AcceptInvitePage({ params }: AcceptInvitePageProps) {
  const { userId, key } = await params;

  return <AcceptInviteForm userId={Number(userId)} inviteKey={key} />;
}
