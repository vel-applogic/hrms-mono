'use client';

import type { EmployeeFeedbackResponseType } from '@repo/dto';
import { EmployeeFeedbackTrendDtoEnum } from '@repo/dto';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/component/shadcn/dialog';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Textarea } from '@repo/ui/component/ui/textarea';
import { useEffect, useState } from 'react';

import { createEmployeeFeedback, updateEmployeeFeedback } from '@/lib/action/employee-feedback.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: number;
  feedback?: EmployeeFeedbackResponseType;
  onSuccess: (feedback: EmployeeFeedbackResponseType) => void;
}

export function EmployeeFeedbackFormDialog({ open, onOpenChange, employeeId, feedback, onSuccess }: Props) {
  const isEditing = !!feedback;
  const [title, setTitle] = useState(feedback?.title ?? '');
  const [trend, setTrend] = useState<EmployeeFeedbackTrendDtoEnum>(feedback?.trend ?? EmployeeFeedbackTrendDtoEnum.neutral);
  const [point, setPoint] = useState(feedback?.point?.toString() ?? '');
  const [text, setText] = useState(feedback?.feedback ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(feedback?.title ?? '');
      setTrend(feedback?.trend ?? EmployeeFeedbackTrendDtoEnum.neutral);
      setPoint(feedback?.point?.toString() ?? '');
      setText(feedback?.feedback ?? '');
      setError('');
    }
  }, [open, feedback?.title, feedback?.trend, feedback?.point, feedback?.feedback]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }
    if (!trimmed) {
      setError('Feedback is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        const result = await updateEmployeeFeedback(feedback!.id, {
          trend,
          point: point ? parseInt(point, 10) : undefined,
          title: trimmedTitle,
          feedback: trimmed,
        }, feedback!.employeeId);
        onSuccess(result);
      } else {
        const result = await createEmployeeFeedback({
          employeeId,
          trend,
          point: point ? parseInt(point, 10) : undefined,
          title: trimmedTitle,
          feedback: trimmed,
        });
        onSuccess(result);
      }
      setTitle('');
      setTrend(EmployeeFeedbackTrendDtoEnum.neutral);
      setPoint('');
      setText('');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTitle(feedback?.title ?? '');
      setTrend(feedback?.trend ?? EmployeeFeedbackTrendDtoEnum.neutral);
      setPoint(feedback?.point?.toString() ?? '');
      setText(feedback?.feedback ?? '');
      setError('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit feedback' : 'Add feedback'}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='title'>Title</Label>
            <Input id='title' value={title} onChange={(e) => setTitle(e.target.value)} placeholder='Feedback title...' />
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Trend</Label>
            <Select value={trend} onValueChange={(val) => setTrend(val as EmployeeFeedbackTrendDtoEnum)}>
              <SelectTrigger>
                <SelectValue placeholder='Select trend' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EmployeeFeedbackTrendDtoEnum).map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='point'>Point (optional)</Label>
            <Input id='point' type='number' value={point} onChange={(e) => setPoint(e.target.value)} placeholder='0' />
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='feedback'>Feedback</Label>
            <Textarea id='feedback' value={text} onChange={(e) => setText(e.target.value)} placeholder='Enter feedback...' rows={4} className='resize-none' />
            {error && <p className='text-sm text-destructive'>{error}</p>}
          </div>
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
