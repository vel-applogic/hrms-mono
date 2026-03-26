export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <nav className='flex items-center border-b border-border bg-primary px-8 py-2'>
        <div className='flex items-center gap-5'>
          <img src='/logo.png' alt='Hrms' width={130} />
        </div>
      </nav>
      <div className='flex flex-1 items-center justify-center'>
        <div className='w-full max-w-[384px]'>{children}</div>
      </div>
    </div>
  );
}
