'use client';

import type { PayslipDetailResponseType } from '@repo/dto';
import { buildPayslipTemplateData, renderPayslipHtml } from '@repo/shared';
import { Dialog, DialogContent } from '@repo/ui/component/shadcn/dialog';
import { useEffect, useRef, useState } from 'react';

import { getPayslipById } from '@/lib/action/payslip.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payslipId: number | null;
}

export function PayslipViewDrawer({ open, onOpenChange, payslipId }: Props) {
  const [payslip, setPayslip] = useState<PayslipDetailResponseType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [iframeHeight, setIframeHeight] = useState(640);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (open && payslipId != null) {
      setLoading(true);
      setError('');
      setPayslip(null);
      getPayslipById(payslipId)
        .then(setPayslip)
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payslip'))
        .finally(() => setLoading(false));
    }
  }, [open, payslipId]);

  const htmlContent = payslip ? renderPayslipHtml(buildPayslipTemplateData(payslip)) : '';

  const handleIframeLoad = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc?.body) {
      setIframeHeight(doc.body.scrollHeight + 8);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl p-0 bg-white [&>button]:text-gray-600'>
        {loading && (
          <div className='flex items-center justify-center py-16'>
            <p className='text-sm text-gray-500'>Loading payslip…</p>
          </div>
        )}

        {error && <p className='m-6 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600'>{error}</p>}

        {payslip && htmlContent && (
          <iframe
            ref={iframeRef}
            srcDoc={htmlContent}
            onLoad={handleIframeLoad}
            title='Payslip'
            style={{ width: '100%', height: `${iframeHeight}px`, border: 'none', display: 'block' }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
