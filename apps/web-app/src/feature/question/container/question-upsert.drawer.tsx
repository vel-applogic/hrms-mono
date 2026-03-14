'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChapterListResponseType, QuestionAnswerOptionType, QuestionDetailResponseType, TopicListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { SelectSearchSingle } from '@repo/ui/component/select-search';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { cn } from '@repo/ui/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useEffect, useState } from 'react';
import { useController, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { ThemeSelector } from '@/app/lib/container/theme-selector';
import { getChaptersList } from '@/lib/action/chapter.actions';
import { createQuestion, updateQuestion } from '@/lib/action/question.actions';
import { getTopicsList } from '@/lib/action/topic.actions';

function generateKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const OptionSchema = z.object({
  key: z.string(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

const FormSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['mcq', 'trueOrFalse']),
  options: z.array(OptionSchema).min(2, 'At least 2 options required'),
  explanation: z.string().min(1, 'Explanation is required'),
  chapterId: z.number().min(1, 'Chapter is required'),
  topicId: z.number().min(1, 'Topic is required'),
  themeIds: z.array(z.number()).optional(),
});

type FormType = z.infer<typeof FormSchema>;

interface QuestionUpsertDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question?: QuestionDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'question-upsert-form';

function answerOptionsToFormOptions(answerOptions: QuestionAnswerOptionType[], correctKeys: string[]): FormType['options'] {
  return answerOptions.map((opt) => ({
    key: opt.key,
    text: opt.value,
    isCorrect: correctKeys.includes(opt.key),
  }));
}

export function QuestionUpsertDrawer({ open, onOpenChange, question, onSuccess }: QuestionUpsertDrawerProps) {
  const isEditing = !!question;
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
      question: '',
      type: 'mcq',
      options: [
        { key: generateKey(), text: '', isCorrect: false },
        { key: generateKey(), text: '', isCorrect: false },
      ],
      explanation: '',
      chapterId: 0,
      topicId: 0,
      themeIds: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const { field: themeIdsField } = useController({ control: form.control, name: 'themeIds' });

  const watchedChapterId = form.watch('chapterId');
  const questionType = form.watch('type');

  const typeOptions = useMemo(() => [
    { label: 'Multiple Choice', value: 'mcq' },
    { label: 'True or False', value: 'trueOrFalse' },
  ], []);

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

    if (question) {
      form.reset({
        question: question.question,
        type: question.type,
        options: answerOptionsToFormOptions(question.answerOptions, question.correctAnswerKeys),
        explanation: question.explanation,
        chapterId: question.chapter.id,
        topicId: question.topic.id,
        themeIds: question.themes?.map((t) => t.id) ?? [],
      });
    } else {
      form.reset({
        question: '',
        type: 'mcq',
        options: [
          { key: generateKey(), text: '', isCorrect: false },
          { key: generateKey(), text: '', isCorrect: false },
        ],
        explanation: '',
        chapterId: 0,
        topicId: 0,
        themeIds: [],
      });
    }
    setError('');
  }, [open, question, form]);

  const handleCorrectToggle = (index: number) => {
    if (questionType === 'mcq') {
      // MCQ allows multiple correct answers, but toggle individually
      const current = form.getValues(`options.${index}.isCorrect`);
      form.setValue(`options.${index}.isCorrect`, !current);
    } else {
      // True/False - only one correct
      fields.forEach((_, i) => {
        form.setValue(`options.${i}.isCorrect`, i === index);
      });
    }
  };

  const handleSubmit = async (data: FormType) => {
    const correctOptions = data.options.filter((o) => o.isCorrect);
    if (correctOptions.length === 0) {
      setError('At least one correct answer is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const submitData = {
        question: data.question,
        type: data.type,
        answerOptions: data.options.map((o) => ({ key: o.key, value: o.text })),
        correctAnswerKeys: data.options.filter((o) => o.isCorrect).map((o) => o.key),
        explanation: data.explanation,
        chapterId: data.chapterId,
        topicId: data.topicId,
        themeIds: data.themeIds,
      };

      if (isEditing && question) {
        await updateQuestion(question.id, submitData);
      } else {
        await createQuestion(submitData);
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

  const selectedThemeIds = themeIdsField.value ?? [];

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit question' : 'New question'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create question'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {/* Question */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='question'>Question</Label>
          <Textarea id='question' placeholder='Enter your question...' className='min-h-[100px] resize-none' {...form.register('question')} />
          {form.formState.errors.question && <p className='text-sm text-destructive'>{form.formState.errors.question.message}</p>}
        </div>

        {/* Type */}
        <div className='flex flex-col gap-2'>
          <Label>Type</Label>
          <SelectSearchSingle
            value={form.watch('type')}
            options={typeOptions}
            placeholder='Select type...'
            onChange={(val) => form.setValue('type', val as 'mcq' | 'trueOrFalse', { shouldValidate: true })}
          />
        </div>

        {/* Chapter */}
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

        {/* Topic */}
        <div className='flex flex-col gap-2'>
          <Label>Topic</Label>
          {topicsLoading ? (
            <p className='text-sm text-muted-foreground'>Loading topics...</p>
          ) : (
            <SelectSearchSingle
              value={form.watch('topicId') > 0 ? String(form.watch('topicId')) : undefined}
              options={topicOptions}
              placeholder={watchedChapterId && watchedChapterId > 0 ? 'Select a topic...' : 'Select a chapter first'}
              searchPlaceholder='Search topics...'
              disabled={!watchedChapterId || watchedChapterId === 0}
              onChange={(val) => form.setValue('topicId', Number(val), { shouldValidate: true })}
            />
          )}
          {form.formState.errors.topicId && <p className='text-sm text-destructive'>{form.formState.errors.topicId.message}</p>}
        </div>

        {/* Options */}
        <div className='flex flex-col gap-3'>
          <Label>Options</Label>

          <div className='flex flex-col gap-2'>
            {fields.map((field, index) => (
              <div key={field.id} className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => handleCorrectToggle(index)}
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center transition-colors',
                    questionType === 'mcq' ? 'rounded' : 'rounded-full',
                    form.watch(`options.${index}.isCorrect`) ? 'bg-success' : 'border-2 border-muted-foreground',
                  )}
                >
                  {form.watch(`options.${index}.isCorrect`) && (
                    <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
                      <path d='M1 4L3.5 6.5L9 1' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                    </svg>
                  )}
                </button>
                <Input placeholder={`Option ${index + 1}`} className='flex-1' {...form.register(`options.${index}.text`)} />
                {fields.length > 2 && (
                  <button type='button' onClick={() => remove(index)} className='text-muted-foreground transition-colors hover:text-destructive'>
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}
          </div>

          {form.formState.errors.options && <p className='text-sm text-destructive'>{form.formState.errors.options.message}</p>}

          <Button type='button' variant='outline' size='sm' onClick={() => append({ key: generateKey(), text: '', isCorrect: false })} className='w-fit'>
            <Plus className='h-4 w-4' />
            Add option
          </Button>
        </div>

        {/* Explanation */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='explanation'>Explanation</Label>
          <Textarea id='explanation' placeholder='Enter explanation for the correct answer...' className='min-h-[100px] resize-none' {...form.register('explanation')} />
          {form.formState.errors.explanation && <p className='text-sm text-destructive'>{form.formState.errors.explanation.message}</p>}
        </div>

        {/* Themes */}
        <div className='flex flex-col gap-2'>
          <Label>
            Themes <span className='text-xs font-normal text-muted-foreground'>(optional)</span>
          </Label>
          <ThemeSelector selectedIds={selectedThemeIds} onChange={themeIdsField.onChange} />
        </div>

        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
