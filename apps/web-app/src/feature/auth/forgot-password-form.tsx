'use client';

import Link from 'next/link';
import React, { useState } from 'react';

import { forgotPassword } from '@/lib/action/auth.actions';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='text-2xl font-semibold text-white'>Check your email</h1>
          <p className='text-sm text-muted-foreground'>If an account with that email exists, we sent a password reset link.</p>
        </div>
        <Link href='/auth/login' className='w-full rounded-[40px] bg-primary py-2 text-center text-sm font-medium text-white transition-opacity hover:opacity-90'>
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-2xl font-semibold text-white'>Forgot password</h1>
        <p className='text-sm text-muted-foreground'>Enter your email to receive a reset link</p>
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
            className='w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none'
          />
        </div>
        {error && <p className='text-sm text-destructive'>{error}</p>}
        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-[40px] bg-primary py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
        <Link href='/auth/login' className='text-center text-sm text-muted-foreground transition-colors hover:text-white'>
          Back to login
        </Link>
      </form>
    </div>
  );
}
