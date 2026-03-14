'use client';

import React from 'react';

import { ScrollArea } from '../../component/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../component/ui/sheet';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  tabs?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  /** When false, disables the ScrollArea wrapper and lets children handle their own scrolling. Defaults to true. */
  scrollable?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onOpenChange, title, description, headerAction, tabs, footer, children, scrollable = true }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-4xl" side="right">
        <SheetHeader className="border-b px-6 pb-4 pt-4">
          <div className="min-w-0 flex-1">
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </div>
          {headerAction && <div className="mt-2">{headerAction}</div>}
        </SheetHeader>
        {tabs && <div className="flex-shrink-0">{tabs}</div>}
        {scrollable ? <ScrollArea className="flex-1 [&>div>div]:!h-full">{children}</ScrollArea> : <div className="flex-1 overflow-hidden">{children}</div>}
        {footer && <div className="flex-shrink-0 border-t px-6 py-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
};
