'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export interface SelectOption {
  label: string;
  value: string;
  keywords?: string[];
}

interface SelectSearchSingleProps {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SelectSearchSingle = (props: SelectSearchSingleProps) => {
  const { value, options, placeholder = 'Select...', searchPlaceholder, emptyMessage = 'No option found.', onChange, onClear, disabled = false, className } = props;
  const [open, setOpen] = React.useState(false);

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
            !value && 'text-muted-foreground',
            value && 'text-white',
            className,
          )}
        >
          <span className='truncate'>{value ? options.find((option) => option.value === value)?.label : placeholder}</span>
          {value && onClear ? (
            <span
              role='button'
              aria-label='Clear selection'
              onClick={(e) => {
                e.stopPropagation();
                onClear();
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
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  keywords={option.keywords}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
