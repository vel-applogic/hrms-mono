'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChapterListResponseType, FlashcardCreateRequestSchema, FlashcardDetailResponseType, TopicListResponseType } from '@repo/dto';
import { SelectSearchSingle } from '@repo/ui/component/select-search';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useMemo, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ThemeSelector } from '@/app/lib/container/theme-selector';
import { getChaptersList } from '@/lib/action/chapter.actions';
import { createFlashcard, updateFlashcard } from '@/lib/action/flashcard.actions';
import { getTopicsList } from '@/lib/action/topic.actions';

const FormSchema = FlashcardCreateRequestSchema;
type FormType = z.infer<typeof FormSchema>;

interface FlashcardUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcard?: FlashcardDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'flashcard-upsert-form';

export function FlashcardUpsertDrawer({ open, onOpenChange, flashcard, onSuccess }: FlashcardUpsertDrawerProps) {
  const isEditing = !!flashcard;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState<ChapterListResponseType[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [topics, setTopics] = useState<TopicListResponseType[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    getChaptersList()
      .then(setChapters)
      .finally(() => setChaptersLoading(false));
  }, []);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      contentFront: '',
      contentBack: '',
      chapterId: undefined,
      topicId: undefined,
      themeIds: [],
    },
  });

  const { field: themeIdsField } = useController({ control: form.control, name: 'themeIds' });

  const watchedChapterId = form.watch('chapterId');

  const chapterOptions = useMemo(() => chapters.map((c) => ({ label: c.title, value: String(c.id) })), [chapters]);
  const topicOptions = useMemo(() => topics.map((t) => ({ label: t.title, value: String(t.id) })), [topics]);

  useEffect(() => {
    if (watchedChapterId && watchedChapterId > 0) {
      setTopicsLoading(true);
      getTopicsList(watchedChapterId)
        .then(setTopics)
        .finally(() => setTopicsLoading(false));
    } else {
      setTopics([]);
    }
  }, [watchedChapterId]);

  useEffect(() => {
    if (!open) return;

    const selectedIds = flashcard ? (flashcard.themes?.map((t) => t.id) ?? []) : [];
    form.reset({
      contentFront: flashcard?.contentFront ?? '',
      contentBack: flashcard?.contentBack ?? '',
      chapterId: flashcard?.chapterId,
      topicId: flashcard?.topicId,
      themeIds: selectedIds,
    });
    setError('');
  }, [open, flashcard, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && flashcard) {
        await updateFlashcard(flashcard.id, data);
      } else {
        await createFlashcard(data);
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

  const selectedIds = themeIdsField.value ?? [];
  const watchedTopicId = form.watch('topicId');

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit flashcard' : 'New flashcard'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create flashcard'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        <div className='flex flex-col gap-2'>
          <Label htmlFor='contentFront'>Front</Label>
          <Textarea id='contentFront' placeholder='Enter front content...' className='min-h-[120px] resize-none' {...form.register('contentFront')} />
          {form.formState.errors.contentFront && <p className='text-sm text-destructive'>{form.formState.errors.contentFront.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='contentBack'>Back</Label>
          <Textarea id='contentBack' placeholder='Enter back content...' className='min-h-[120px] resize-none' {...form.register('contentBack')} />
          {form.formState.errors.contentBack && <p className='text-sm text-destructive'>{form.formState.errors.contentBack.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Chapter</Label>
          {chaptersLoading ? (
            <p className='text-sm text-muted-foreground'>Loading chapters...</p>
          ) : (
            <SelectSearchSingle
              value={watchedChapterId && watchedChapterId > 0 ? String(watchedChapterId) : undefined}
              options={chapterOptions}
              placeholder='Select a chapter...'
              searchPlaceholder='Search chapters...'
              onChange={(val) => {
                form.setValue('chapterId', Number(val), { shouldValidate: true });
                form.setValue('topicId', 0);
              }}
            />
          )}
          {form.formState.errors.chapterId && <p className='text-sm text-destructive'>{form.formState.errors.chapterId.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Topic</Label>
          {topicsLoading ? (
            <p className='text-sm text-muted-foreground'>Loading topics...</p>
          ) : (
            <SelectSearchSingle
              value={watchedTopicId && watchedTopicId > 0 ? String(watchedTopicId) : undefined}
              options={topicOptions}
              placeholder={watchedChapterId && watchedChapterId > 0 ? 'Select a topic...' : 'Select a chapter first'}
              searchPlaceholder='Search topics...'
              disabled={!watchedChapterId || watchedChapterId === 0}
              onChange={(val) => form.setValue('topicId', Number(val), { shouldValidate: true })}
            />
          )}
          {form.formState.errors.topicId && <p className='text-sm text-destructive'>{form.formState.errors.topicId.message}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label>
            Themes <span className='text-xs font-normal text-muted-foreground'>(optional)</span>
          </Label>
          <ThemeSelector selectedIds={selectedIds} onChange={themeIdsField.onChange} />
        </div>

        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
