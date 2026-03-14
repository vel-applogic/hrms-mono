import { LoginForm } from '@/feature/auth/login-form';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <nav className='flex items-center border-b border-border px-8 py-2'>
        <div className='flex items-center gap-5'>
          <img src='/logo.svg' alt='Hrms' width={52} height={36} />
          <span className='rounded border border-primary px-1.5 py-0.5 text-sm font-bold tracking-widest text-white'>ADMIN</span>
        </div>
      </nav>
      <div className='flex flex-1 items-center justify-center'>
        <div className='w-full max-w-[384px]'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
