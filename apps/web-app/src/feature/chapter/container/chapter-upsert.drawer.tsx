'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChapterCreateRequestSchema, ChapterDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { createChapter, updateChapter } from '@/lib/action/chapter.actions';

const FormSchema = ChapterCreateRequestSchema.omit({ media: true }).extend({
  summaryPoints: z.array(z.object({ value: z.string() })).optional(),
});
type FormType = z.infer<typeof FormSchema>;

interface ChapterUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapter?: ChapterDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'chapter-upsert-form';

function toFieldArray(points: string[] | undefined) {
  if (!points || points.length === 0) return [{ value: '' }];
  return points.map((value) => ({ value }));
}

function fromFieldArray(points: { value: string }[] | undefined) {
  return (points ?? []).map((p) => p.value).filter((v) => v.trim().length > 0);
}

export function ChapterUpsertDrawer({ open, onOpenChange, chapter, onSuccess }: ChapterUpsertDrawerProps) {
  const isEditing = !!chapter;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      description: '',
      summaryPoints: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'summaryPoints',
  });

  useEffect(() => {
    if (open) {
      if (chapter) {
        form.reset({
          title: chapter.title,
          description: chapter.description ?? '',
          summaryPoints: toFieldArray(chapter.summaryPoints),
        });
      } else {
        form.reset({ title: '', description: '', summaryPoints: [{ value: '' }] });
      }
      setError('');
    }
  }, [open, chapter, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      const payload = {
        title: data.title,
        description: data.description,
        summaryPoints: fromFieldArray(data.summaryPoints),
      };
      if (isEditing && chapter) {
        await updateChapter(chapter.id, payload);
      } else {
        await createChapter(payload);
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
      title={isEditing ? 'Edit chapter' : 'New chapter'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create chapter'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' placeholder='Enter chapter title...' {...form.register('title')} />
          {form.formState.errors.title && <p className='text-sm text-destructive'>{form.formState.errors.title.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='description'>Description</Label>
          <Textarea id='description' placeholder='Enter chapter description...' className='min-h-[100px] resize-none' {...form.register('description')} />
          {form.formState.errors.description && <p className='text-sm text-destructive'>{form.formState.errors.description.message}</p>}
        </div>

        <div className='flex flex-col gap-3'>
          <Label>Summary points</Label>
          <div className='flex flex-col gap-2'>
            {fields.map((field, index) => (
              <div key={field.id} className='flex items-center gap-2'>
                <Input placeholder={`Summary point ${index + 1}`} {...form.register(`summaryPoints.${index}.value`)} />
                {fields.length > 1 && (
                  <button type='button' onClick={() => remove(index)} className='shrink-0 text-muted-foreground transition-colors hover:text-destructive'>
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type='button' variant='outline' size='sm' onClick={() => append({ value: '' })} className='w-fit'>
            <Plus className='h-4 w-4' />
            Add summary point
          </Button>
        </div>

        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
