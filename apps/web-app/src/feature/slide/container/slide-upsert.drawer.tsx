'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChapterListResponseType, SlideCreateRequestSchema, SlideDetailResponseType, TopicListResponseType } from '@repo/dto';
import { SelectSearchSingle } from '@repo/ui/component/select-search';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useMemo, useState } from 'react';
import { useController, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ThemeSelector } from '@/app/lib/container/theme-selector';
import { getChaptersList } from '@/lib/action/chapter.actions';
import { createSlide, updateSlide } from '@/lib/action/slide.actions';
import { getTopicsList } from '@/lib/action/topic.actions';

import { SlideUpsertContent } from './slide-upsert-content';

const FormSchema = SlideCreateRequestSchema;
type FormType = z.infer<typeof FormSchema>;

interface SlideUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slide?: SlideDetailResponseType | null;
  topicId?: number;
  chapterId?: number;
  onSuccess: () => void;
}

const FORM_ID = 'slide-upsert-form';

const emptyDefaults = (topicId: number, chapterId: number): FormType => ({
  content: { list: [] },
  topicId,
  chapterId,
  themeIds: [],
});

function parseSlideContent(raw: string): FormType['content'] {
  try {
    return JSON.parse(raw) as FormType['content'];
  } catch {
    return { list: [] };
  }
}

export function SlideUpsertDrawer({ open, onOpenChange, slide, topicId, chapterId, onSuccess }: SlideUpsertDrawerProps) {
  const isEditing = !!slide;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chapters, setChapters] = useState<ChapterListResponseType[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [topics, setTopics] = useState<TopicListResponseType[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  const showSelectors = chapterId === undefined || topicId === undefined;

  const resolvedTopicId = slide?.topic.id ?? topicId ?? 0;
  const resolvedChapterId = slide?.chapter.id ?? chapterId ?? 0;

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: emptyDefaults(resolvedTopicId, resolvedChapterId),
  });

  const { field: themeIdsField } = useController({ control: form.control, name: 'themeIds' });

  const watchedChapterId = form.watch('chapterId');
  const watchedTopicId = form.watch('topicId');

  const chapterOptions = useMemo(() => chapters.map((c) => ({ label: c.title, value: String(c.id) })), [chapters]);
  const topicOptions = useMemo(() => topics.map((t) => ({ label: t.title, value: String(t.id) })), [topics]);

  useEffect(() => {
    if (!showSelectors) return;
    getChaptersList()
      .then(setChapters)
      .finally(() => setChaptersLoading(false));
  }, [showSelectors]);

  useEffect(() => {
    if (!showSelectors) return;
    if (watchedChapterId && watchedChapterId > 0) {
      setTopicsLoading(true);
      getTopicsList(watchedChapterId)
        .then(setTopics)
        .finally(() => setTopicsLoading(false));
    } else {
      setTopics([]);
    }
  }, [watchedChapterId, showSelectors]);

  useEffect(() => {
    if (!open) return;
    const selectedIds = slide ? (slide.themes?.map((t) => t.id) ?? []) : [];
    const content = slide ? parseSlideContent(slide.content) : { list: [] };
    form.reset({ content, topicId: resolvedTopicId, chapterId: resolvedChapterId, themeIds: selectedIds });
    setError('');
  }, [open, slide, resolvedTopicId, resolvedChapterId, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && slide) {
        await updateSlide(slide.id, data);
      } else {
        await createSlide(data);
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

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit slide' : 'New slide'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create slide'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        <SlideUpsertContent control={form.control} setValue={form.setValue} setError={form.setError} errors={form.formState.errors} />

        {showSelectors && (
          <>
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
          </>
        )}

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
