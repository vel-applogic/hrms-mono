'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { acceptInvite } from '@/lib/action/auth.actions';

interface AcceptInviteFormProps {
  userId: number;
  inviteKey: string;
}

export function AcceptInviteForm({ userId, inviteKey }: AcceptInviteFormProps) {
  const router = useRouter();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearErrors = () => {
    setPasswordErrors([]);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (password !== confirmPassword) {
      setPasswordErrors(['Passwords do not match']);
      return;
    }

    setLoading(true);

    const result = await acceptInvite({ userId, inviteKey, firstname, lastname, password });

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2500);
      return;
    }

    const { message, field, fieldErrors } = result.error;
    const apiPasswordErrors = fieldErrors?.password;
    if (apiPasswordErrors?.length) {
      setPasswordErrors(apiPasswordErrors);
    } else if (field === 'password') {
      setPasswordErrors([message]);
    } else {
      setFormError(message);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className='flex flex-col gap-6 text-center'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-semibold text-white'>Account activated!</h1>
          <p className='text-sm text-muted-foreground'>Your account is ready. Redirecting to login…</p>
        </div>
        <Link
          href='/auth/login'
          className='text-center text-sm text-primary transition-colors hover:opacity-80'
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-2xl font-semibold text-white'>Accept invitation</h1>
        <p className='text-sm text-muted-foreground'>Set up your name and password to activate your account.</p>
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-3'>
            <label htmlFor='accept-firstname' className='text-sm font-medium text-secondary-foreground'>
              First name
            </label>
            <input
              id='accept-firstname'
              type='text'
              placeholder='John'
              value={firstname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
              required
              className='w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none'
            />
          </div>
          <div className='flex flex-col gap-3'>
            <label htmlFor='accept-lastname' className='text-sm font-medium text-secondary-foreground'>
              Last name
            </label>
            <input
              id='accept-lastname'
              type='text'
              placeholder='Doe'
              value={lastname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
              required
              className='w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none'
            />
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <label htmlFor='accept-password' className='text-sm font-medium text-secondary-foreground'>
            Password
          </label>
          <input
            id='accept-password'
            type='password'
            placeholder='••••••••'
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className='w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none'
          />
          {passwordErrors.length > 0 && (
            <ul className='flex flex-col gap-1'>
              {passwordErrors.map((e) => (
                <li key={e} className='text-sm text-destructive'>{e}</li>
              ))}
            </ul>
          )}
        </div>
        <div className='flex flex-col gap-3'>
          <label htmlFor='accept-confirm-password' className='text-sm font-medium text-secondary-foreground'>
            Confirm password
          </label>
          <input
            id='accept-confirm-password'
            type='password'
            placeholder='••••••••'
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            className='w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none'
          />
        </div>
        <p className='text-xs text-muted-foreground'>
          Min 6 characters, max 20. Must include uppercase, lowercase, number, and special character (!@#$%^&*).
        </p>
        {formError && <p className='text-sm text-destructive'>{formError}</p>}
        <button
          type='submit'
          disabled={loading}
          className='w-full rounded-[40px] bg-primary py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50'
        >
          {loading ? 'Activating...' : 'Activate Account'}
        </button>
        <Link
          href='/auth/login'
          className='text-center text-sm text-muted-foreground transition-colors hover:text-white'
        >
          Back to login
        </Link>
      </form>
    </div>
  );
}
