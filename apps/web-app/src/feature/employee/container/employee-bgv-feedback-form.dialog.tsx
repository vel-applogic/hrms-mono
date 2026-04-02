'use client';

import type { EmployeeBgvFeedbackResponseType, MediaUpsertType } from '@repo/dto';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/shadcn/dialog';
import { Button } from '@repo/ui/component/ui/button';
import { Label } from '@repo/ui/component/ui/label';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { useEffect, useState } from 'react';

import { FileUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createEmployeeBgvFeedback, updateEmployeeBgvFeedback } from '@/lib/action/employee-bgv-feedback.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  feedback?: EmployeeBgvFeedbackResponseType;
  onSuccess: (feedback: EmployeeBgvFeedbackResponseType) => void;
}

export function EmployeeBgvFeedbackFormDialog({ open, onOpenChange, employeeId, feedback, onSuccess }: Props) {
  const isEditing = !!feedback;
  const [text, setText] = useState(feedback?.feedback ?? '');
  const [files, setFiles] = useState<MediaUpsertType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setText(feedback?.feedback ?? '');
      setFiles([]);
      setError('');
    }
  }, [open, feedback?.feedback]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Feedback is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        const result = await updateEmployeeBgvFeedback(feedback!.id, { feedback: trimmed }, feedback!.employeeId);
        onSuccess(result);
      } else {
        const result = await createEmployeeBgvFeedback({
          employeeId,
          feedback: trimmed,
          files: files.length > 0 ? files : undefined,
        });
        onSuccess(result);
      }
      setText('');
      setFiles([]);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setText(feedback?.feedback ?? '');
      setFiles([]);
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit BGV feedback' : 'Add BGV feedback'}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='bgv-feedback'>Feedback</Label>
            <Textarea id='bgv-feedback' value={text} onChange={(e) => setText(e.target.value)} placeholder='Enter BGV feedback...' rows={4} className='resize-none' />
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
          {!isEditing && (
            <div className='flex flex-col gap-2'>
              <Label>Attachments (optional)</Label>
              <FileUpload
                isMultiple
                media={files}
                onUploaded={(val) => setFiles((prev) => [...prev, val])}
                onRemove={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                onError={() => {}}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
