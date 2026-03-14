import Link from 'next/link';

import { verifyEmail } from '@/lib/action/auth.actions';

interface VerifyEmailPageProps {
  params: Promise<{ userId: string; key: string }>;
}

export default async function VerifyEmailPage({ params }: VerifyEmailPageProps) {
  const { userId, key } = await params;

  const result = await verifyEmail({ userId: Number(userId), key });

  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <nav className='flex items-center border-b border-border px-8 py-2'>
        <div className='flex items-center gap-5'>
          <img src='/logo.svg' alt='Hrms' width={52} height={36} />
          <span className='rounded border border-primary px-1.5 py-0.5 text-sm font-bold tracking-widest text-white'>ADMIN</span>
        </div>
      </nav>
      <div className='flex flex-1 items-center justify-center'>
        <div className='flex w-full max-w-[384px] flex-col gap-8 text-center'>
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
      </div>
    </div>
  );
}
