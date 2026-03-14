'use client';

import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PolicyCreateRequestSchema } from '@repo/dto';
import { MarkdownEditor } from '@repo/ui/component/markdown-editor';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { GripVertical, Image, Trash2, Type } from 'lucide-react';
import { Control, useController, useFieldArray, UseFormSetError, UseFormSetValue, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { ImageUpload } from '@/container/s3-file-upload/s3-file-upload';

type FormType = z.infer<typeof PolicyCreateRequestSchema>;

const MarkdownEditorField = ({ control, index }: { control: Control<FormType>; index: number }) => {
  const { field } = useController({ control, name: `content.list.${index}.content` });
  return <MarkdownEditor value={field.value ?? ''} onChange={field.onChange} placeholder='Enter text content...' className='w-full' />;
};

interface SortableItemProps {
  id: string;
  index: number;
  control: Control<FormType>;
  watchedList: FormType['content']['list'];
  onRemove: (index: number) => void;
  onImageUploaded: (index: number, val: FormType['content']['list'][number]['image']) => void;
  onImageRemove: (index: number) => void;
  onImageError: (index: number, err?: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
}

const SortableItem = ({ id, index, control, watchedList, onRemove, onImageUploaded, onImageRemove, onImageError, errors }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fieldType = watchedList[index]?.type;

  return (
    <div ref={setNodeRef} style={style} className='flex flex-col gap-1.5'>
      {fieldType === 'text' && (
        <div className='flex items-start gap-2'>
          <button type='button' className='mt-2 cursor-grab touch-none text-muted-foreground active:cursor-grabbing' aria-label='Drag to reorder' {...attributes} {...listeners}>
            <GripVertical className='h-4 w-4' />
          </button>
          <MarkdownEditorField control={control} index={index} />
          <button type='button' onClick={() => onRemove(index)} className='mt-2 text-muted-foreground transition-colors hover:text-destructive' aria-label='Remove block'>
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      )}

      {fieldType === 'image' && (
        <div className='flex items-start gap-2'>
          <button type='button' className='mt-2 cursor-grab touch-none text-muted-foreground active:cursor-grabbing' aria-label='Drag to reorder' {...attributes} {...listeners}>
            <GripVertical className='h-4 w-4' />
          </button>
          <div className='w-full'>
            <ImageUpload
              isMultiple={false}
              media={watchedList[index]?.image ? [watchedList[index].image!] : []}
              onUploaded={(val) => onImageUploaded(index, val)}
              onRemove={() => onImageRemove(index)}
              onError={(err) => onImageError(index, err)}
            />
          </div>
          <button type='button' onClick={() => onRemove(index)} className='mt-2 text-muted-foreground transition-colors hover:text-destructive' aria-label='Remove block'>
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      )}

      {errors?.content?.list?.[index]?.content && <p className='text-sm text-destructive'>{errors.content.list[index].content?.message}</p>}
      {errors?.content?.list?.[index]?.image && <p className='text-sm text-destructive'>{errors.content.list[index].image?.message}</p>}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(errors?.content?.list?.[index] as any)?.root?.message && (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        <p className='text-sm text-destructive'>{(errors?.content?.list?.[index] as any).root.message}</p>
      )}
    </div>
  );
};

interface PolicyUpsertContentProps {
  control: Control<FormType>;
  setValue: UseFormSetValue<FormType>;
  setError: UseFormSetError<FormType>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: Record<string, any>;
}

export const PolicyUpsertContent = ({ control, setValue, setError, errors }: PolicyUpsertContentProps) => {
  const { fields, append, remove, move } = useFieldArray({ control, name: 'content.list' });
  const watchedList = useWatch({ control, name: 'content.list' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) move(oldIndex, newIndex);
    }
  };

  const listError = errors?.content?.list;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='title'>Title</Label>
        <Input id='title' {...control.register('title')} placeholder='Policy title' className='w-full' />
        {errors?.title && <p className='text-sm text-destructive'>{errors.title.message}</p>}
      </div>

      <div className='flex flex-col gap-3'>
        <Label>Content</Label>

        {fields.length === 0 && (
          <p className='rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground'>No content blocks yet. Add a text or image block below.</p>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            <div className='flex flex-col gap-3'>
              {fields.map((field, index) => (
                <SortableItem
                  key={field.id}
                  id={field.id}
                  index={index}
                  control={control}
                  watchedList={watchedList ?? []}
                  onRemove={remove}
                  onImageUploaded={(i, val) => setValue(`content.list.${i}.image`, val, { shouldValidate: true })}
                  onImageRemove={(i) => setValue(`content.list.${i}.image`, undefined, { shouldValidate: true })}
                  onImageError={(i, err) => err && setError(`content.list.${i}.image`, { message: err })}
                  errors={errors}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {typeof listError?.message === 'string' && <p className='text-sm text-destructive'>{listError.message}</p>}

        <div className='flex gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={() => append({ type: 'text', content: '' })}>
            <Type className='h-4 w-4' />
            Add Text
          </Button>
          <Button type='button' variant='outline' size='sm' onClick={() => append({ type: 'image' })}>
            <Image className='h-4 w-4' />
            Add Image
          </Button>
        </div>
      </div>
    </div>
  );
};
