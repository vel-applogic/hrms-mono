'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CandidateCreateRequestSchema,
  CandidateDetailResponseType,
  CandidateProgressDtoEnum,
  CandidateSourceDtoEnum,
  CandidateStatusDtoEnum,
  NoticePeriodUnitDtoEnum,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FileUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createCandidate, updateCandidate } from '@/lib/action/candidate.actions';

const FormSchema = CandidateCreateRequestSchema;
type FormType = z.infer<typeof FormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate?: CandidateDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'candidate-upsert-form';

function toStringFieldArray(values: string[] | undefined) {
  if (!values || values.length === 0) return [{ value: '' }];
  return values.map((value) => ({ value }));
}

function fromStringFieldArray(fields: { value: string }[] | undefined) {
  return (fields ?? []).map((f) => f.value).filter((v) => v.trim().length > 0);
}

export function CandidateUpsertDrawer({ open, onOpenChange, candidate, onSuccess }: Props) {
  const isEditing = !!candidate;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      contactNumbers: [],
      source: CandidateSourceDtoEnum.linkedin,
      urls: [],
      expInYears: 0,
      relevantExpInYears: 0,
      skills: [],
      currentCtcInLacs: 0,
      expectedCtcInLacs: 0,
      noticePeriod: 0,
      noticePeriodUnit: NoticePeriodUnitDtoEnum.days,
      status: CandidateStatusDtoEnum.new,
      progress: CandidateProgressDtoEnum.new,
    },
  });

  // Local state for string arrays
  const [contactNumbers, setContactNumbers] = useState<string[]>(['']);
  const [urls, setUrls] = useState<string[]>(['']);
  const [skills, setSkills] = useState<string[]>(['']);

  useEffect(() => {
    if (open) {
      if (candidate) {
        form.reset({
          firstname: candidate.firstname,
          lastname: candidate.lastname,
          email: candidate.email,
          contactNumbers: candidate.contactNumbers,
          source: candidate.source as CandidateSourceDtoEnum,
          urls: candidate.urls,
          expInYears: candidate.expInYears,
          relevantExpInYears: candidate.relevantExpInYears,
          skills: candidate.skills,
          currentCtcInLacs: candidate.currentCtcInLacs,
          expectedCtcInLacs: candidate.expectedCtcInLacs,
          noticePeriod: candidate.noticePeriod,
          noticePeriodUnit: candidate.noticePeriodUnit as NoticePeriodUnitDtoEnum,
          status: candidate.status as CandidateStatusDtoEnum,
          progress: candidate.progress as CandidateProgressDtoEnum,
          resume: candidate.resume ? { key: candidate.resume.key, name: candidate.resume.name, type: candidate.resume.type } : undefined,
        });
        setContactNumbers(candidate.contactNumbers.length > 0 ? candidate.contactNumbers : ['']);
        setUrls(candidate.urls.length > 0 ? candidate.urls : ['']);
        setSkills(candidate.skills.length > 0 ? candidate.skills : ['']);
      } else {
        form.reset({
          firstname: '',
          lastname: '',
          email: '',
          contactNumbers: [],
          source: CandidateSourceDtoEnum.linkedin,
          urls: [],
          expInYears: 0,
          relevantExpInYears: 0,
          skills: [],
          currentCtcInLacs: 0,
          expectedCtcInLacs: 0,
          noticePeriod: 0,
          noticePeriodUnit: NoticePeriodUnitDtoEnum.days,
          status: CandidateStatusDtoEnum.new,
          progress: CandidateProgressDtoEnum.new,
        });
        setContactNumbers(['']);
        setUrls(['']);
        setSkills(['']);
      }
      setError('');
    }
  }, [open, candidate, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      const payload: FormType = {
        ...data,
        contactNumbers: contactNumbers.filter((v) => v.trim().length > 0),
        urls: urls.filter((v) => v.trim().length > 0),
        skills: skills.filter((v) => v.trim().length > 0),
      };
      if (isEditing && candidate) {
        await updateCandidate(candidate.id, payload);
      } else {
        await createCandidate(payload);
      }
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resumeValue = form.watch('resume');

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit candidate' : 'New candidate'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create candidate'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {/* Name row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='firstname'>First name</Label>
            <Input id='firstname' placeholder='First name' {...form.register('firstname')} />
            {form.formState.errors.firstname && <p className='text-sm text-destructive'>{form.formState.errors.firstname.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='lastname'>Last name</Label>
            <Input id='lastname' placeholder='Last name' {...form.register('lastname')} />
            {form.formState.errors.lastname && <p className='text-sm text-destructive'>{form.formState.errors.lastname.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className='flex flex-col gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' placeholder='candidate@example.com' {...form.register('email')} />
          {form.formState.errors.email && <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>}
        </div>

        {/* Source */}
        <div className='flex flex-col gap-2'>
          <Label>Source</Label>
          <Select value={form.watch('source')} onValueChange={(val) => form.setValue('source', val as CandidateSourceDtoEnum)}>
            <SelectTrigger>
              <SelectValue placeholder='Select source' />
            </SelectTrigger>
            <SelectContent>
              {Object.values(CandidateSourceDtoEnum).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contact Numbers */}
        <div className='flex flex-col gap-3'>
          <Label>Contact numbers</Label>
          <div className='flex flex-col gap-2'>
            {contactNumbers.map((num, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Input
                  placeholder={`Phone ${i + 1}`}
                  value={num}
                  onChange={(e) => {
                    const updated = [...contactNumbers];
                    updated[i] = e.target.value;
                    setContactNumbers(updated);
                  }}
                />
                {contactNumbers.length > 1 && (
                  <button type='button' onClick={() => setContactNumbers(contactNumbers.filter((_, idx) => idx !== i))} className='shrink-0 text-muted-foreground hover:text-destructive'>
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type='button' variant='outline' size='sm' onClick={() => setContactNumbers([...contactNumbers, ''])} className='w-fit'>
            <Plus className='h-4 w-4' />
            Add contact
          </Button>
        </div>

        {/* URLs */}
        <div className='flex flex-col gap-3'>
          <Label>Links / URLs</Label>
          <div className='flex flex-col gap-2'>
            {urls.map((url, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Input
                  placeholder={`https://linkedin.com/in/...`}
                  value={url}
                  onChange={(e) => {
                    const updated = [...urls];
                    updated[i] = e.target.value;
                    setUrls(updated);
                  }}
                />
                {urls.length > 1 && (
                  <button type='button' onClick={() => setUrls(urls.filter((_, idx) => idx !== i))} className='shrink-0 text-muted-foreground hover:text-destructive'>
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type='button' variant='outline' size='sm' onClick={() => setUrls([...urls, ''])} className='w-fit'>
            <Plus className='h-4 w-4' />
            Add URL
          </Button>
        </div>

        {/* Skills */}
        <div className='flex flex-col gap-3'>
          <Label>Skills</Label>
          <div className='flex flex-col gap-2'>
            {skills.map((skill, i) => (
              <div key={i} className='flex items-center gap-2'>
                <Input
                  placeholder={`e.g. React, Node.js`}
                  value={skill}
                  onChange={(e) => {
                    const updated = [...skills];
                    updated[i] = e.target.value;
                    setSkills(updated);
                  }}
                />
                {skills.length > 1 && (
                  <button type='button' onClick={() => setSkills(skills.filter((_, idx) => idx !== i))} className='shrink-0 text-muted-foreground hover:text-destructive'>
                    <Trash2 className='h-4 w-4' />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button type='button' variant='outline' size='sm' onClick={() => setSkills([...skills, ''])} className='w-fit'>
            <Plus className='h-4 w-4' />
            Add skill
          </Button>
        </div>

        {/* Experience row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='expInYears'>Total exp (years)</Label>
            <Input id='expInYears' type='number' step='0.5' min='0' placeholder='0' {...form.register('expInYears', { valueAsNumber: true })} />
            {form.formState.errors.expInYears && <p className='text-sm text-destructive'>{form.formState.errors.expInYears.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='relevantExpInYears'>Relevant exp (years)</Label>
            <Input id='relevantExpInYears' type='number' step='0.5' min='0' placeholder='0' {...form.register('relevantExpInYears', { valueAsNumber: true })} />
            {form.formState.errors.relevantExpInYears && <p className='text-sm text-destructive'>{form.formState.errors.relevantExpInYears.message}</p>}
          </div>
        </div>

        {/* CTC row */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='currentCtcInLacs'>Current CTC (lacs)</Label>
            <Input id='currentCtcInLacs' type='number' step='0.5' min='0' placeholder='0' {...form.register('currentCtcInLacs', { valueAsNumber: true })} />
            {form.formState.errors.currentCtcInLacs && <p className='text-sm text-destructive'>{form.formState.errors.currentCtcInLacs.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='expectedCtcInLacs'>Expected CTC (lacs)</Label>
            <Input id='expectedCtcInLacs' type='number' step='0.5' min='0' placeholder='0' {...form.register('expectedCtcInLacs', { valueAsNumber: true })} />
            {form.formState.errors.expectedCtcInLacs && <p className='text-sm text-destructive'>{form.formState.errors.expectedCtcInLacs.message}</p>}
          </div>
        </div>

        {/* Notice period */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='noticePeriod'>Notice period</Label>
            <Input id='noticePeriod' type='number' min='0' placeholder='30' {...form.register('noticePeriod', { valueAsNumber: true })} />
            {form.formState.errors.noticePeriod && <p className='text-sm text-destructive'>{form.formState.errors.noticePeriod.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Unit</Label>
            <Select value={form.watch('noticePeriodUnit')} onValueChange={(val) => form.setValue('noticePeriodUnit', val as NoticePeriodUnitDtoEnum)}>
              <SelectTrigger>
                <SelectValue placeholder='Unit' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(NoticePeriodUnitDtoEnum).map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status + Progress */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label>Status</Label>
            <Select value={form.watch('status') ?? ''} onValueChange={(val) => form.setValue('status', val as CandidateStatusDtoEnum)}>
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CandidateStatusDtoEnum).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='flex flex-col gap-2'>
            <Label>Progress</Label>
            <Select value={form.watch('progress') ?? ''} onValueChange={(val) => form.setValue('progress', val as CandidateProgressDtoEnum)}>
              <SelectTrigger>
                <SelectValue placeholder='Select progress' />
              </SelectTrigger>
              <SelectContent>
                {Object.values(CandidateProgressDtoEnum).map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resume — single file */}
        <div className='flex flex-col gap-2'>
          <Label>Resume</Label>
          <FileUpload
            isMultiple={false}
            media={resumeValue ? [resumeValue] : []}
            onUploaded={(val) => form.setValue('resume', val)}
            onRemove={() => form.setValue('resume', undefined)}
            onError={(err) => err && form.setError('resume', { message: err })}
          />
          {form.formState.errors.resume && <p className='text-sm text-destructive'>{String(form.formState.errors.resume.message)}</p>}
        </div>

        {error && <p className='text-sm text-destructive'>{error}</p>}
      </form>
    </Drawer>
  );
}
