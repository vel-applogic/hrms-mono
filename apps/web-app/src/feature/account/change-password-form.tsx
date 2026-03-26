'use client';

import React, { useState } from 'react';

import { changePassword } from '@/lib/action/account.actions';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    setLoading(true);
    const result = await changePassword({ currentPassword, newPassword, confirmPassword });
    setLoading(false);

    if (result.ok) {
      setSuccessMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMessage(result.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
      <div className="flex flex-col gap-3">
        <label htmlFor="currentPassword" className="text-sm font-medium text-secondary-foreground">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
          required
          className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="newPassword" className="text-sm font-medium text-secondary-foreground">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          placeholder="••••••••"
          value={newPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          required
          className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
        <p className="text-xs text-muted-foreground">
          Min 6 characters, max 20. Must include uppercase, lowercase, number, and special character (!@#$%^&*).
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-secondary-foreground">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
          className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
      {successMessage && <p className="text-sm text-green-500">{successMessage}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[40px] bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Change password'}
      </button>
    </form>
  );
}
