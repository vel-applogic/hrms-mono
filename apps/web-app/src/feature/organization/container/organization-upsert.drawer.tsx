'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { OrganizationResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createOrganization, updateOrganization } from '@/lib/action/organization.actions';

const CreateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Valid email is required'),
});

const UpdateFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
});

type CreateFormType = z.infer<typeof CreateFormSchema>;
type UpdateFormType = z.infer<typeof UpdateFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: OrganizationResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'organization-upsert-form';

export function OrganizationUpsertDrawer({ open, onOpenChange, organization, onSuccess }: Props) {
  const isEditing = !!organization;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createForm = useForm<CreateFormType>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: { name: '', email: '' },
  });

  const updateForm = useForm<UpdateFormType>({
    resolver: zodResolver(UpdateFormSchema),
    defaultValues: { name: '' },
  });

  const activeForm = isEditing ? updateForm : createForm;

  useEffect(() => {
    if (open) {
      if (organization) {
        updateForm.reset({ name: organization.name });
      } else {
        createForm.reset({ name: '', email: '' });
      }
      setError('');
    }
  }, [open, organization, createForm, updateForm]);

  const applyActionError = (error: { message: string; fieldErrors?: { field: string; message: string }[] }) => {
    if (error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (isEditing) {
          updateForm.setError(field as keyof UpdateFormType, { type: 'server', message });
        } else {
          createForm.setError(field as keyof CreateFormType, { type: 'server', message });
        }
      });
    } else {
      setError(error.message);
    }
  };

  const handleCreateSubmit = async (data: CreateFormType) => {
    setLoading(true);
    setError('');
    try {
      const result = await createOrganization({
        name: data.name,
        email: data.email,
      });

      if (!result.ok) {
        applyActionError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (data: UpdateFormType) => {
    if (!organization) return;
    setLoading(true);
    setError('');
    try {
      const result = await updateOrganization(organization.id, {
        id: organization.id,
        name: data.name,
      });

      if (!result.ok) {
        applyActionError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit organization' : 'New organization'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create organization'}
          </Button>
        </div>
      }
    >
      {isEditing ? (
        <form id={FORM_ID} onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className='flex flex-col gap-6 p-6'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>Organization name</Label>
            <Input id='name' placeholder='e.g. Acme Corp' {...updateForm.register('name')} />
            {updateForm.formState.errors.name && <p className='text-sm text-destructive'>{updateForm.formState.errors.name.message}</p>}
          </div>
        </form>
      ) : (
        <form id={FORM_ID} onSubmit={createForm.handleSubmit(handleCreateSubmit)} className='flex flex-col gap-6 p-6'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>Organization name</Label>
            <Input id='name' placeholder='e.g. Acme Corp' {...createForm.register('name')} />
            {createForm.formState.errors.name && <p className='text-sm text-destructive'>{createForm.formState.errors.name.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>Admin email</Label>
            <Input id='email' type='email' placeholder='admin@example.com' {...createForm.register('email')} />
            {createForm.formState.errors.email && <p className='text-sm text-destructive'>{createForm.formState.errors.email.message}</p>}
            <p className='text-xs text-muted-foreground'>This user will be invited as admin of the organization</p>
          </div>
        </form>
      )}
    </Drawer>
  );
}
