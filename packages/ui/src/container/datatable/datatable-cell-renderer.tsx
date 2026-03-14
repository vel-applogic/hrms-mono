'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Check, EllipsisVertical, LucideIcon, Pencil } from 'lucide-react';

import { ActionIconButton } from '../../component/button';
import Spinner from '../../component/spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../component/shadcn/dropdown-menu';
import { Input } from '../../component/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../component/shadcn/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../component/shadcn/tooltip';
import { cn } from '../../lib/utils';

// --- Actions Cell Renderer ---

export interface ActionOption {
  name: string;
  icon?: LucideIcon;
  showBoth?: boolean;
  variant?: 'outline' | 'outline-danger';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionsIconCellRendererParams<TData = any> {
  context: {
    onClickActions: (action: string, data: TData) => void;
  };
  data: TData & { loading?: boolean };
  options?: (string | ActionOption)[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ActionsIconCellRenderer = <TData = any,>(props: ActionsIconCellRendererParams<TData>) => {
  const onClick = (action: string) => {
    props.context.onClickActions(action, props.data);
  };

  // Handle both old format (string[]) and new format (ActionOption[])
  const options: ActionOption[] =
    props.options?.map((opt: string | ActionOption) => {
      if (typeof opt === 'string') {
        return { name: opt };
      }
      return opt;
    }) || [];

  if (props.data.loading)
    return (
      <div className="!flex items-center justify-center">
        <Spinner variant="small" />
      </div>
    );

  const visibleOptions = options.slice(0, 3);
  const dropdownOptions = options.slice(3);

  return (
    <TooltipProvider>
      <div className="!flex h-full w-full items-center justify-center space-x-1">
        {/* Render first 3 options as icon buttons */}
        {visibleOptions.map((option, index) => {
          const Icon = option.icon;
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <ActionIconButton onClick={() => onClick(option.name)} customVariant={option.variant || 'outline'} className="w-auto px-2">
                  {option.showBoth && Icon ? (
                    <span className="flex items-center gap-1 text-xs">
                      <Icon size={14} /> {option.name}
                    </span>
                  ) : Icon ? (
                    <Icon size={14} />
                  ) : (
                    <span className="text-xs">{option.name.charAt(0)}</span>
                  )}
                </ActionIconButton>
              </TooltipTrigger>
              <TooltipContent align="center" side="left" className="border-primary bg-primary">
                {option.name}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Render remaining options in dropdown if any */}
        {dropdownOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ActionIconButton customVariant="outline">
                <EllipsisVertical size={14} />
              </ActionIconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {dropdownOptions.map((option, index) => {
                const Icon = option.icon;
                const isDestructive = option.variant === 'outline-danger';
                return (
                  <DropdownMenuItem key={index} onClick={() => onClick(option.name)} className={isDestructive ? 'text-destructive focus:text-destructive' : ''}>
                    <div className="flex items-center gap-2">
                      {Icon && <Icon size={16} />}
                      <span>{option.name}</span>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </TooltipProvider>
  );
};

// --- Text Renderers ---

export const CellTextRenderer = (props: { text?: string }) => {
  return <div className="whitespace-pre-wrap text-sm">{props.text}</div>;
};

export const BadgeRenderer = (props: { text?: string; className?: string }) => {
  return <div className={cn('inline-flex items-center rounded-md bg-card px-2 py-1 text-sm font-medium text-foreground', props.className)}>{props.text ?? '-'}</div>;
};

// --- Date/Time Renderers ---

export const DateTimeRenderer = (props: { value?: Date | string; format?: string }) => {
  const defaultFormat = "MM/dd/yyyy 'at' h:mm a";
  let val = '-';
  if (props.value) {
    const dateValue = typeof props.value === 'string' ? new Date(props.value) : props.value;
    val = format(dateValue, props.format ?? defaultFormat);
  }

  return <div className="inline-flex items-center text-sm font-medium text-muted-foreground">{val}</div>;
};

export const DateRenderer = (props: { value?: Date | string; format?: string }) => {
  const defaultFormat = 'dd/MM/yyyy';
  let val = '-';
  if (props.value) {
    const dateValue = typeof props.value === 'string' ? new Date(props.value) : props.value;
    val = format(dateValue, props.format ?? defaultFormat);
  }

  return <div className="inline-flex items-center text-sm font-medium text-muted-foreground">{val}</div>;
};

// --- Phone Number Renderer ---

export const PhoneNumberRenderer = (props: { code?: string; number?: string }) => {
  const parts = [props.code, props.number].filter((i) => i != null && i.trim().length);
  return <BadgeRenderer text={parts.length ? parts.join(' ') : 'na'} />;
};

// --- Account State Renderer ---

export const AccountStateRenderer = (props: { isActive: boolean }) => {
  let className = 'text-xs ';
  if (props.isActive) {
    className += 'bg-success/20 text-success';
  } else {
    className += 'bg-warning/20 text-warning';
  }
  return <BadgeRenderer className={className} text={props.isActive ? 'Activated' : 'No'} />;
};

// --- Name With Avatar Renderer ---

export const NameWithAvatarCellRenderer = (props: {
  user?: {
    firstname?: string;
    lastname?: string;
    email?: string;
  } | null;
}) => {
  if (!props.user || !props.user.email) {
    return null;
  }

  const { firstname, lastname, email } = props.user;

  const fullName = `${firstname || ''} ${lastname || ''}`.trim();
  const displayName = fullName || email;
  const initials = fullName
    ? fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">{initials}</div>
      <span className="text-foreground">{displayName}</span>
    </div>
  );
};

// --- Editable Price Cell Renderer ---

export interface EditablePriceCellRendererProps {
  value: number | null | undefined;
  onSave: (newValue: number) => Promise<{ success: boolean; error?: string }>;
  onEditingChange?: (isEditing: boolean, colId: string) => void;
  colId?: string;
}

export const EditablePriceCellRenderer = (props: EditablePriceCellRendererProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const enterEditMode = () => {
    setIsEditing(true);
    if (props.colId) {
      props.onEditingChange?.(true, props.colId);
    }
  };

  const exitEditMode = () => {
    setIsEditing(false);
    if (props.colId) {
      props.onEditingChange?.(false, props.colId);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    setEditValue(props.value?.toString() || '');
    enterEditMode();
  };

  const handleConfirm = async (e?: React.MouseEvent | React.FocusEvent) => {
    if (e && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    if (isLoading) return;

    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      exitEditMode();
      return;
    }

    // If value hasn't changed, just exit edit mode
    if (numValue === props.value) {
      exitEditMode();
      return;
    }

    setIsLoading(true);

    try {
      const result = await props.onSave(numValue);

      if (result.success) {
        exitEditMode();
      } else {
        const { toast } = await import('sonner');
        toast.error(result.error || 'Failed to save');
        exitEditMode();
      }
    } catch {
      const { toast } = await import('sonner');
      toast.error('Failed to save');
      exitEditMode();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      if (!isLoading) {
        exitEditMode();
      }
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
      },
      { passive: false },
    );
  };

  const stopAllPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isEditing || isLoading) {
    return (
      <div className="flex items-center gap-1" onClick={stopAllPropagation} onMouseDown={stopAllPropagation} onMouseUp={stopAllPropagation}>
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className="h-7 text-sm"
          autoFocus={!isLoading}
          onBlur={isLoading ? undefined : handleConfirm}
          disabled={isLoading}
        />
        {isLoading ? (
          <div className="flex h-7 w-7 items-center justify-center">
            <Spinner variant="small" />
          </div>
        ) : (
          <span className="flex" onMouseDown={stopAllPropagation} onClick={stopAllPropagation}>
            <ActionIconButton onClick={handleConfirm} customVariant="outline" className="h-7 w-auto px-2">
              <Check size={14} />
            </ActionIconButton>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{props.value != null ? `${props.value.toLocaleString()}` : '-'}</span>
      <ActionIconButton onClick={handleEditClick} customVariant="outline" className="h-6 w-auto px-1.5 opacity-60 hover:opacity-100 [&_svg]:!size-3">
        <Pencil />
      </ActionIconButton>
    </div>
  );
};

// --- Editable Select Cell Renderer (badge + dropdown) ---

export interface EditableSelectCellRendererProps {
  value?: string;
  data?: { id: number };
  options: { value: string; label: string }[];
  badgeColors: Record<string, string>;
  onSave: (id: number, newValue: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh?: () => void;
}

export const EditableSelectCellRenderer = (props: EditableSelectCellRendererProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const value = props.value ?? '';
  const id = props.data?.id;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading || !id) return;
    setIsEditing(true);
  };

  const handleSelect = async (newValue: string) => {
    if (isLoading || !id || newValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    try {
      const result = await props.onSave(id, newValue);

      if (result.success) {
        setIsEditing(false);
        props.onRefresh?.();
      } else {
        const { toast } = await import('sonner');
        toast.error(result.error || 'Failed to save');
        setIsEditing(false);
      }
    } catch {
      const { toast } = await import('sonner');
      toast.error('Failed to save');
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const stopAllPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) setIsEditing(false);
  };

  if (isEditing || isLoading) {
    return (
      <div className="flex items-center gap-1" onClick={stopAllPropagation} onMouseDown={stopAllPropagation} onMouseUp={stopAllPropagation}>
        <Select value={value} onValueChange={handleSelect} onOpenChange={handleOpenChange} disabled={isLoading}>
          <SelectTrigger className="h-7 min-w-[120px] text-sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isLoading && (
          <div className="flex h-7 w-7 items-center justify-center">
            <Spinner variant="small" />
          </div>
        )}
      </div>
    );
  }

  const badgeClass = props.badgeColors[value] ?? 'border-border';

  return (
    <div className="flex items-center gap-1.5">
      {value ? (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', badgeClass)}>
          {value}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      )}
      <ActionIconButton
        onClick={handleEditClick}
        customVariant="outline"
        className="h-6 w-auto px-1 opacity-60 hover:opacity-100 [&_svg]:!size-3"
      >
        <Pencil size={12} />
      </ActionIconButton>
    </div>
  );
};
