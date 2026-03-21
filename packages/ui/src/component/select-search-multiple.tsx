'use client';

import { ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';
import { Checkbox } from './shadcn/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { SelectOption } from './select-search';

interface SelectSearchMultiProps {
  values?: string[];
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onChange: (values: string[]) => void;
  disabled?: boolean;
  className?: string;
}

export const SelectSearchMulti = (props: SelectSearchMultiProps) => {
  const { values = [], options, placeholder = 'Select...', searchPlaceholder, emptyMessage = 'No option found.', onChange, disabled = false, className } = props;
  const [open, setOpen] = React.useState(false);

  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val));
    } else {
      onChange([...values, val]);
    }
  };

  const selectedLabels = options.filter((o) => values.includes(o.value)).map((o) => o.label);
  const triggerText = selectedLabels.join(', ');

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            values.length === 0 && 'text-muted-foreground',
            className,
          )}
        >
          <span className='truncate min-w-0 flex-1 text-left'>
            {values.length === 0 ? placeholder : triggerText}
          </span>
          {values.length > 0 ? (
            <span
              role='button'
              aria-label='Clear selection'
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className='ml-2 shrink-0 rounded-sm opacity-50 transition-opacity hover:opacity-100'
            >
              <X className='h-4 w-4' />
            </span>
          ) : (
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start' sideOffset={4}>
        <Command>
          <CommandInput placeholder={searchPlaceholder || placeholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const selected = values.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    keywords={option.keywords}
                    onSelect={() => toggle(option.value)}
                  >
                    <Checkbox checked={selected} className='mr-2 pointer-events-none' />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
