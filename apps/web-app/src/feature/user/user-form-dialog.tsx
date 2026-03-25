'use client';

import { type AdminUserListResponseType, UserRoleDtoEnum } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/ui/dialog';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import React, { useEffect, useState } from 'react';

import { createUser, updateUser } from '@/lib/service/user.service';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: AdminUserListResponseType | null;
  onSuccess: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const isEditing = !!user;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [role, setRole] = useState<UserRoleDtoEnum>(UserRoleDtoEnum.admin);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstname(user.firstname);
      setLastname(user.lastname);
      setRole(user.roles[0]);
      setPassword('');
    } else {
      setEmail('');
      setFirstname('');
      setLastname('');
      setRole(UserRoleDtoEnum.admin);
      setPassword('');
    }
    setError('');
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isEditing && user) {
        await updateUser(user.id, {
          email,
          firstname,
          lastname,
          role,
          ...(password ? { password } : {}),
        });
      } else {
        await createUser({ email, firstname, lastname, role, password });
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input id='email' type='email' value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstname'>First Name</Label>
              <Input id='firstname' value={firstname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)} required />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastname'>Last Name</Label>
              <Input id='lastname' value={lastname} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)} required />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRoleDtoEnum)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='superAdmin'>Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='password'>Password{isEditing ? ' (leave empty to keep)' : ''}</Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required={!isEditing}
              minLength={8}
            />
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
