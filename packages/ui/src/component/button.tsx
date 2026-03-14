'use client';
import * as React from 'react';

import { Button as BaseButton, ButtonProps as BaseButtonProps } from './shadcn/button';
import { cn } from '../lib/utils';

export interface ActionIconButtonProps extends BaseButtonProps {
  customVariant?: 'outline' | 'outline-danger';
}

const ActionIconButton = React.forwardRef<HTMLButtonElement, ActionIconButtonProps>(({ customVariant, className: classNameProp, ...props }, ref) => {
  let className = '';
  if (customVariant === 'outline-danger') {
    className = 'border-destructive/30 bg-destructive/10';
  }
  return <BaseButton variant="outline" size="icon" className={cn('h-8 w-8 text-xs', className, classNameProp)} ref={ref} {...props} />;
});
ActionIconButton.displayName = 'ActionIconButton';

export { ActionIconButton };
