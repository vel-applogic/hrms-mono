'use client';

import type { CandidateListResponseType } from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';

import { convertCandidateToEmployee } from '@/lib/action/candidate.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: CandidateListResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'candidate-convert-form';

export function CandidateConvertToEmployeeDrawer({ open, onOpenChange, candidate, onSuccess }: Props) {
  const [employeeCode, setEmployeeCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setEmployeeCode('');
      setDesignation('');
      setDateOfJoining('');
      setError('');
      setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;

    const errors: Record<string, string> = {};
    if (!employeeCode.trim()) errors.employeeCode = 'Employee code is required';
    if (!designation.trim()) errors.designation = 'Designation is required';
    if (!dateOfJoining) errors.dateOfJoining = 'Date of joining is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const result = await convertCandidateToEmployee(candidate.id, {
        employeeCode: employeeCode.trim(),
        designation: designation.trim(),
        dateOfJoining,
      });
      if (result.success) {
        onOpenChange(false);
        onSuccess();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title='Convert to Employee'
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Converting...' : 'Convert to Employee'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}

        {candidate && (
          <div className='rounded-lg border border-border bg-muted/30 p-4'>
            <p className='text-sm font-medium'>{candidate.firstname} {candidate.lastname}</p>
            <p className='text-sm text-muted-foreground'>{candidate.email}</p>
          </div>
        )}

        <div className='flex flex-col gap-2'>
          <Label htmlFor='employeeCode'>Employee code</Label>
          <Input id='employeeCode' placeholder='e.g. EMP001' value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} />
          {fieldErrors.employeeCode && <p className='text-sm text-destructive'>{fieldErrors.employeeCode}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='designation'>Designation</Label>
          <Input id='designation' placeholder='e.g. Software Engineer' value={designation} onChange={(e) => setDesignation(e.target.value)} />
          {fieldErrors.designation && <p className='text-sm text-destructive'>{fieldErrors.designation}</p>}
        </div>

        <div className='flex flex-col gap-2'>
          <Label htmlFor='dateOfJoining'>Date of joining</Label>
          <Input id='dateOfJoining' type='date' value={dateOfJoining} onChange={(e) => setDateOfJoining(e.target.value)} />
          {fieldErrors.dateOfJoining && <p className='text-sm text-destructive'>{fieldErrors.dateOfJoining}</p>}
        </div>

        <p className='text-xs text-muted-foreground'>
          The candidate&apos;s name, email, DOB, PAN, and Aadhaar will be used to create the employee record. An invitation email will be sent.
        </p>
      </form>
    </Drawer>
  );
}
