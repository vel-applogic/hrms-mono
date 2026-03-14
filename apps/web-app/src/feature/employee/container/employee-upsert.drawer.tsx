'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  EmployeeCreateRequestSchema,
  EmployeeDetailResponseType,
  EmployeeStatusDtoEnum,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { FileUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createEmployee, updateEmployee } from '@/lib/action/employee.actions';

const CreateFormSchema = EmployeeCreateRequestSchema;
const UpdateFormSchema = CreateFormSchema.omit({ password: true });
type CreateFormType = z.infer<typeof CreateFormSchema>;
type UpdateFormType = z.infer<typeof UpdateFormSchema>;
type FormType = CreateFormType | UpdateFormType;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeDetailResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'employee-upsert-form';

export function EmployeeUpsertDrawer({ open, onOpenChange, employee, onSuccess }: Props) {
  const isEditing = !!employee;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<FormType>({
    resolver: zodResolver(isEditing ? UpdateFormSchema : CreateFormSchema),
    defaultValues: {
      firstname: '',
      lastname: '',
      email: '',
      personalEmail: undefined,
      dob: '',
      pan: '',
      aadhaar: '',
      designation: '',
      dateOfJoining: '',
      dateOfLeaving: undefined,
      status: EmployeeStatusDtoEnum.active,
      reportToId: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      if (employee) {
        form.reset({
          firstname: employee.firstname,
          lastname: employee.lastname,
          email: employee.email,
          personalEmail: employee.personalEmail ?? undefined,
          dob: employee.dob,
          pan: employee.pan,
          aadhaar: employee.aadhaar,
          designation: employee.designation,
          dateOfJoining: employee.dateOfJoining,
          dateOfLeaving: employee.dateOfLeaving ?? undefined,
          status: employee.status as EmployeeStatusDtoEnum,
          reportToId: employee.reportToId ?? undefined,
          photo: employee.photo ? { key: employee.photo.key, name: employee.photo.name, type: employee.photo.type } : undefined,
        });
      } else {
        form.reset({
          firstname: '',
          lastname: '',
          email: '',
          personalEmail: undefined,
          dob: '',
          pan: '',
          aadhaar: '',
          designation: '',
          dateOfJoining: '',
          dateOfLeaving: undefined,
          status: EmployeeStatusDtoEnum.active,
          reportToId: undefined,
          password: '',
        });
      }
      setError('');
    }
  }, [open, employee, form]);

  const handleSubmit = async (data: FormType) => {
    setLoading(true);
    setError('');
    try {
      if (isEditing && employee) {
        await updateEmployee(employee.id, {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          personalEmail: data.personalEmail ?? null,
          dob: data.dob,
          pan: data.pan,
          aadhaar: data.aadhaar,
          designation: data.designation,
          dateOfJoining: data.dateOfJoining,
          dateOfLeaving: data.dateOfLeaving ?? null,
          status: data.status,
          reportToId: data.reportToId ?? null,
          photo: data.photo,
        });
      } else {
        await createEmployee({
          ...data,
          password: (data as CreateFormType).password,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          personalEmail: data.personalEmail ?? undefined,
          dob: data.dob,
          pan: data.pan,
          aadhaar: data.aadhaar,
          designation: data.designation,
          dateOfJoining: data.dateOfJoining,
          dateOfLeaving: data.dateOfLeaving ?? undefined,
          status: data.status,
          reportToId: data.reportToId ?? undefined,
          photo: data.photo,
        });
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

  const photoValue = form.watch('photo');

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit employee' : 'New employee'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create employee'}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 p-6'>
        {error && <p className='text-sm text-destructive'>{error}</p>}

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

        <div className='flex flex-col gap-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' placeholder='employee@example.com' {...form.register('email')} />
          {form.formState.errors.email && <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>}
        </div>

        {!isEditing && (
          <div className='flex flex-col gap-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' placeholder='••••••••' {...form.register('password')} />
            {form.formState.errors.password && <p className='text-sm text-destructive'>{form.formState.errors.password.message}</p>}
          </div>
        )}

        <div className='flex flex-col gap-2'>
          <Label htmlFor='personalEmail'>Personal email</Label>
          <Input id='personalEmail' type='email' placeholder='personal@example.com' {...form.register('personalEmail')} />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='dob'>Date of birth</Label>
            <Input id='dob' type='date' {...form.register('dob')} />
            {form.formState.errors.dob && <p className='text-sm text-destructive'>{form.formState.errors.dob.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='designation'>Designation</Label>
            <Input id='designation' placeholder='Designation' {...form.register('designation')} />
            {form.formState.errors.designation && <p className='text-sm text-destructive'>{form.formState.errors.designation.message}</p>}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='pan'>PAN</Label>
            <Input id='pan' placeholder='PAN' {...form.register('pan')} />
            {form.formState.errors.pan && <p className='text-sm text-destructive'>{form.formState.errors.pan.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='aadhaar'>Aadhaar</Label>
            <Input id='aadhaar' placeholder='Aadhaar' {...form.register('aadhaar')} />
            {form.formState.errors.aadhaar && <p className='text-sm text-destructive'>{form.formState.errors.aadhaar.message}</p>}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='dateOfJoining'>Date of joining</Label>
            <Input id='dateOfJoining' type='date' {...form.register('dateOfJoining')} />
            {form.formState.errors.dateOfJoining && <p className='text-sm text-destructive'>{form.formState.errors.dateOfJoining.message}</p>}
          </div>
          <div className='flex flex-col gap-2'>
            <Label htmlFor='dateOfLeaving'>Date of leaving</Label>
            <Input id='dateOfLeaving' type='date' {...form.register('dateOfLeaving')} />
          </div>
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Status</Label>
          <Select value={form.watch('status')} onValueChange={(val) => form.setValue('status', val as EmployeeStatusDtoEnum)}>
            <SelectTrigger>
              <SelectValue placeholder='Select status' />
            </SelectTrigger>
            <SelectContent>
              {Object.values(EmployeeStatusDtoEnum).map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/([A-Z])/g, ' $1').trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex flex-col gap-2'>
          <Label>Photo</Label>
          <FileUpload
            isMultiple={false}
            media={photoValue ? [photoValue] : []}
            onUploaded={(val) => form.setValue('photo', val)}
            onRemove={() => form.setValue('photo', undefined)}
            onError={() => {}}
            variant='dark'
            previewFirst
          />
        </div>
      </form>
    </Drawer>
  );
}
