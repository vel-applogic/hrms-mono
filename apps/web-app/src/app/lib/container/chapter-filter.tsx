'use client';

import { ChapterListResponseType } from '@repo/dto';
import { SelectOption, SelectSearchSingle } from '@repo/ui/component/select-search';
import { useEffect, useState } from 'react';

import { getChaptersList } from '@/lib/action/chapter.actions';

interface ChapterFilterProps {
  value?: number;
  onChange: (chapterId: number | undefined) => void;
}

export function ChapterFilter({ value, onChange }: ChapterFilterProps) {
  const [chapters, setChapters] = useState<ChapterListResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChaptersList()
      .then(setChapters)
      .finally(() => setLoading(false));
  }, []);

  const options: SelectOption[] = chapters.map((c) => ({ label: c.title, value: String(c.id) }));

  const handleChange = (val: string) => {
    onChange(val ? Number(val) : undefined);
  };

  return (
    <SelectSearchSingle
      value={value ? String(value) : undefined}
      options={options}
      placeholder='Chapter'
      searchPlaceholder='Search chapters...'
      onChange={handleChange}
      onClear={() => onChange(undefined)}
      disabled={loading}
      className='w-[200px]'
    />
  );
}
