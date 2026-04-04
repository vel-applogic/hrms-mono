'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get('reset') === 'success';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-2xl font-semibold text-foreground'>Welcome back</h1>
        <p className='text-sm text-muted-foreground'>Sign in to your admin account</p>
        {resetSuccess && <p className='text-sm text-green-500'>Password reset successfully. You can now log in.</p>}
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='flex flex-col gap-3'>
          <label htmlFor='email' className='text-sm font-medium text-secondary-foreground'>
            Email
          </label>
          <input
            id='email'
            type='email'
            placeholder='admin@hrms.app'
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            className='w-full rounded-[40px] border border-input bg-white px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'
          />
        </div>
        <div className='flex flex-col gap-3'>
          <label htmlFor='password' className='text-sm font-medium text-secondary-foreground'>
            Password
          </label>
          <input
            id='password'
            type='password'
            placeholder='chicken-tenders'
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className='w-full rounded-[40px] border border-input bg-white px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none'
          />
        </div>
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-[40px] bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <Link href='/auth/forgot-password' className='text-center text-sm text-muted-foreground transition-colors hover:text-foreground'>
          Forgot password?
        </Link>
      </form>
    </div>
  );
}
