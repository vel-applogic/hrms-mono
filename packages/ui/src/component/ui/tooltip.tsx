'use client';

import { Tooltip as TooltipPrimitive } from 'radix-ui';
import * as React from 'react';

import { TooltipContent as ShadcnTooltipContent } from '../shadcn/tooltip';

export { Tooltip, TooltipProvider, TooltipTrigger } from '../shadcn/tooltip';

const TooltipContent = React.forwardRef<React.ElementRef<typeof ShadcnTooltipContent>, React.ComponentPropsWithoutRef<typeof ShadcnTooltipContent>>(
  ({ children, ...props }, ref) => (
    <ShadcnTooltipContent ref={ref} {...props}>
      {children}
      <TooltipPrimitive.Arrow className='fill-primary' width={10} height={5} />
    </ShadcnTooltipContent>
  ),
);
TooltipContent.displayName = 'TooltipContent';

export { TooltipContent };
