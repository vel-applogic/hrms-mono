'use client';

import { ThemeListResponseType } from '@repo/dto';
import { SelectOption } from '@repo/ui/component/select-search';
import { SelectSearchMulti } from '@repo/ui/component/select-search-multiple';
import { useEffect, useState } from 'react';

import { getThemesList } from '@/lib/action/theme.actions';

interface ThemeFilterProps {
  values?: number[];
  onChange: (themeIds: number[]) => void;
}

export function ThemeFilter({ values, onChange }: ThemeFilterProps) {
  const [themes, setThemes] = useState<ThemeListResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getThemesList()
      .then(setThemes)
      .finally(() => setLoading(false));
  }, []);

  const options: SelectOption[] = themes.map((t) => ({ label: t.title, value: String(t.id) }));

  const handleChange = (vals: string[]) => {
    onChange(vals.map(Number));
  };

  return (
    <SelectSearchMulti
      values={values?.map(String)}
      options={options}
      placeholder='Theme'
      searchPlaceholder='Search themes...'
      onChange={handleChange}
      disabled={loading}
      className='w-[200px]'
    />
  );
}
