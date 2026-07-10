'use client';

import { Toaster } from 'sonner';

import { TOAST_DURATION_MS } from '@/lib/util/toast';

export function AppToaster() {
  return <Toaster position='bottom-right' duration={TOAST_DURATION_MS} richColors closeButton />;
}
