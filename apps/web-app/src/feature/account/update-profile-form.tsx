'use client';

import React, { useState } from 'react';

import { updateProfile } from '@/lib/action/account.actions';

interface Props {
  initialFirstname: string;
  initialLastname: string;
  email: string;
}

export function UpdateProfileForm({ initialFirstname, initialLastname, email }: Props) {
  const [firstname, setFirstname] = useState(initialFirstname);
  const [lastname, setLastname] = useState(initialLastname);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!firstname.trim()) {
      setErrorMessage('First name is required');
      return;
    }
    if (!lastname.trim()) {
      setErrorMessage('Last name is required');
      return;
    }

    setLoading(true);
    const result = await updateProfile({ firstname: firstname.trim(), lastname: lastname.trim() });
    setLoading(false);

    if (result.ok) {
      setSuccessMessage('Profile updated successfully.');
    } else {
      setErrorMessage(result.error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-md">
      <div className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium text-secondary-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          disabled
          className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground opacity-60 cursor-not-allowed"
        />
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="firstname" className="text-sm font-medium text-secondary-foreground">
          First name
        </label>
        <input
          id="firstname"
          type="text"
          placeholder="First name"
          value={firstname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
          required
          className="w-full rounded-[40px] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-3">
        <label htmlFor="lastname" className="text-sm font-medium text-secondary-foreground">
          Last name
        </label>
        <input
          id="lastname"
          type="text"
          placeholder="Last name"
          value={lastname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
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
        {loading ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
