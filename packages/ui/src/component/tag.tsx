import { X } from 'lucide-react';

import { cn } from '../lib/utils';

interface TagRemovableProps {
  text: string;
  onRemove: () => void;
  className?: string;
}

export function TagRemovable({ text, onRemove, className }: TagRemovableProps) {
  return (
    <div className={cn('inline-flex w-fit items-center rounded-md border border-border bg-card text-sm font-medium text-white', className)}>
      <span className="px-2.5 py-1">{text}</span>
      <div className="w-px self-stretch bg-border" />
      <button type="button" onClick={onRemove} className="flex cursor-pointer items-center justify-center px-2 py-1 text-muted-foreground transition-colors hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
