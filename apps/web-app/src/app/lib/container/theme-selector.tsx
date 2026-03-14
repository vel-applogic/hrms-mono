'use client';

import { ThemeListResponseType } from '@repo/dto';
import { useEffect, useState } from 'react';

import { getThemesList } from '@/lib/action/theme.actions';

interface ThemeSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function ThemeSelector({ selectedIds, onChange }: ThemeSelectorProps) {
  const [themes, setThemes] = useState<ThemeListResponseType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getThemesList()
      .then(setThemes)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) => {
    const next = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];
    onChange(next);
  };

  if (loading) return <p className='text-sm text-muted-foreground'>Loading themes...</p>;
  if (themes.length === 0) return <p className='text-sm text-muted-foreground'>No themes available.</p>;

  return (
    <div className='flex flex-wrap gap-1.5'>
      {themes.map((theme) => {
        const selected = selectedIds.includes(theme.id);
        return (
          <button
            key={theme.id}
            type='button'
            onClick={() => toggle(theme.id)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
              selected ? 'border-primary bg-primary/10 text-white' : 'border-border bg-background text-muted-foreground'
            }`}
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors ${
                selected ? 'bg-success' : 'border-2 border-muted-foreground'
              }`}
            >
              {selected && (
                <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
                  <path d='M1 4L3.5 6.5L9 1' stroke='white' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              )}
            </div>
            <span>{theme.title}</span>
          </button>
        );
      })}
    </div>
  );
}
