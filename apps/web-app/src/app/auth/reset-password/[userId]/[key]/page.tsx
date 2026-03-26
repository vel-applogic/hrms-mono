import { ResetPasswordForm } from '@/feature/auth/reset-password-form';

interface ResetPasswordPageProps {
  params: Promise<{ userId: string; key: string }>;
}

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { userId, key } = await params;

  return <ResetPasswordForm userId={Number(userId)} resetKey={key} />;
}
