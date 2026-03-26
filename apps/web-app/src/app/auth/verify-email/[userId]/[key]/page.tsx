import Link from 'next/link';

import { verifyEmail } from '@/lib/action/auth.actions';

interface VerifyEmailPageProps {
  params: Promise<{ userId: string; key: string }>;
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { userId, key } = await params;

  const result = await verifyEmail({ userId: Number(userId), key });

  return (
    <div className='flex flex-col gap-8 text-center'>
      {result.ok ? (
        <>
          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl font-semibold text-white'>Email verified</h1>
            <p className='text-sm text-muted-foreground'>Your email has been verified successfully. You can now log in.</p>
          </div>
          <Link href='/auth/login' className='w-full rounded-[40px] bg-primary py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90'>
            Go to login
          </Link>
        </>
      ) : (
        <>
          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl font-semibold text-white'>Verification failed</h1>
            <p className='text-sm text-destructive'>{result.error.message}</p>
          </div>
          <Link href='/auth/login' className='text-center text-sm text-muted-foreground transition-colors hover:text-white'>
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}
