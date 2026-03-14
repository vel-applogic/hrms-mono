'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PolicyCreateRequestSchema, PolicyDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { createPolicy, updatePolicy } from '@/lib/action/policy.actions';

import { PolicyUpsertContent } from './policy-upsert-content';

const FormSchema = PolicyCreateRequestSchema;
type FormType = z.infer<typeof FormSchema>;

interface PolicyUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: PolicyDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'policy-upsert-form';

const emptyDefaults: FormType = {
  title: '',
  content: { list: [] },
  mediaIds: [],
};

function parsePolicyContent(raw: string): FormType['content'] {
  try {
    return JSON.parse(raw) as FormType['content'];
  } catch {
    return { list: [] };
  }
}

export function PolicyUpsertDrawer({ open, onOpenChange, policy, onSuccess }: PolicyUpsertDrawerProps) {
  const isEditing = !!policy;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (!open) return;
    const content = policy ? parsePolicyContent(policy.content) : { list: [] };
    form.reset({ title: policy?.title ?? '', content, mediaIds: policy?.medias?.map((m) => m.id) ?? [] });
    setError('');
  }, [open, policy, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && policy) {
        await updatePolicy(policy.id, data);
      } else {
        await createPolicy(data);
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
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit policy' : 'New policy'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create policy'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        <PolicyUpsertContent control={form.control} setValue={form.setValue} setError={form.setError} errors={form.formState.errors} />
        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
