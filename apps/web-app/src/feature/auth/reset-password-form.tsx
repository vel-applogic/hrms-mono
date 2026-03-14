'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { resetPassword } from '@/lib/action/auth.actions';

interface ResetPasswordFormProps {
  userId: number;
  resetKey: string;
}

export function ResetPasswordForm({ userId, resetKey }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

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

    const result = await resetPassword({ userId, key: resetKey, password });

    if (result.ok) {
      router.push('/auth/login?reset=success');
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Reset password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <label htmlFor="password" className="text-sm font-medium text-secondary-foreground">
            New password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {passwordErrors.length > 0 && (
            <ul className="flex flex-col gap-1">
              {passwordErrors.map((e) => (
                <li key={e} className="text-sm text-destructive">{e}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-secondary-foreground">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            required
            className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Min 6 characters, max 20. Must include uppercase, lowercase, number, and special character (!@#$%^&*).
        </p>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[40px] bg-primary py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
        <Link
          href="/auth/login"
          className="text-center text-sm text-muted-foreground transition-colors hover:text-white"
        >
          Back to login
        </Link>
      </form>
    </div>
  );
}
