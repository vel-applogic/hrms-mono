'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChapterListResponseType, TopicCreateRequestSchema, TopicDetailResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { SelectSearchSingle } from '@repo/ui/component/select-search';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getChaptersList } from '@/lib/action/chapter.actions';
import { createTopic, updateTopic } from '@/lib/action/topic.actions';

const FormSchema = TopicCreateRequestSchema.omit({ media: true });
type FormType = z.infer<typeof FormSchema>;

interface TopicUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topic?: TopicDetailResponseType | null;
  chapterId?: number;
  onSuccess: () => void;
}

const FORM_ID = 'topic-upsert-form';

export function TopicUpsertDrawer({ open, onOpenChange, topic, chapterId, onSuccess }: TopicUpsertDrawerProps) {
  const isEditing = !!topic;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const showChapterSelector = !chapterId;
  const [chapters, setChapters] = useState<ChapterListResponseType[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(showChapterSelector);

  useEffect(() => {
    if (showChapterSelector) {
      getChaptersList()
        .then(setChapters)
        .finally(() => setChaptersLoading(false));
    }
  }, [showChapterSelector]);

  const chapterOptions = useMemo(() => chapters.map((c) => ({ label: c.title, value: String(c.id) })), [chapters]);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      chapterId: chapterId ?? 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (topic) {
        form.reset({ title: topic.title, chapterId: topic.chapterId });
      } else {
        form.reset({ title: '', chapterId: chapterId ?? 0 });
      }
      setError('');
    }
  }, [open, topic, chapterId, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && topic) {
        await updateTopic(topic.id, data);
      } else {
        await createTopic(data);
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
      title={isEditing ? 'Edit topic' : 'New topic'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create topic'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='title'>Title</Label>
          <Input id='title' placeholder='Enter topic title...' {...form.register('title')} />
          {form.formState.errors.title && <p className='text-sm text-destructive'>{form.formState.errors.title.message}</p>}
        </div>

        {showChapterSelector && (
          <div className='flex flex-col gap-2'>
            <Label>Chapter</Label>
            {chaptersLoading ? (
              <p className='text-sm text-muted-foreground'>Loading chapters...</p>
            ) : (
              <SelectSearchSingle
                value={form.watch('chapterId') > 0 ? String(form.watch('chapterId')) : undefined}
                options={chapterOptions}
                placeholder='Select a chapter...'
                searchPlaceholder='Search chapters...'
                onChange={(val) => form.setValue('chapterId', Number(val), { shouldValidate: true })}
              />
            )}
            {form.formState.errors.chapterId && <p className='text-sm text-destructive'>{form.formState.errors.chapterId.message}</p>}
          </div>
        )}

        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
