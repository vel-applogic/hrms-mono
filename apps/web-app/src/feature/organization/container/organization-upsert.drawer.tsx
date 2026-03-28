'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  MediaTypeDtoEnum,
  NoOfDaysInMonthDtoEnum,
  OrganizationDocumentResponseType,
  OrganizationResponseType,
  UpsertMediaType,
} from '@repo/dto';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FileUpload, ImageUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createOrganization, getOrganizationById, updateOrganization } from '@/lib/action/organization.actions';

const SettingsSchema = z.object({
  noOfDaysInMonth: z.nativeEnum(NoOfDaysInMonthDtoEnum),
  totalLeaveInDays: z.number().int().min(0),
  sickLeaveInDays: z.number().int().min(0),
  earnedLeaveInDays: z.number().int().min(0),
  casualLeaveInDays: z.number().int().min(0),
  maternityLeaveInDays: z.number().int().min(0),
  paternityLeaveInDays: z.number().int().min(0),
});

const BaseFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  settings: SettingsSchema,
});

const CreateFormSchema = BaseFormSchema.extend({
  email: z.string().email('Valid email is required'),
});

const UpdateFormSchema = BaseFormSchema;

type CreateFormType = z.infer<typeof CreateFormSchema>;
type UpdateFormType = z.infer<typeof UpdateFormSchema>;

const DEFAULT_SETTINGS = {
  noOfDaysInMonth: NoOfDaysInMonthDtoEnum.thirty,
  totalLeaveInDays: 24,
  sickLeaveInDays: 10,
  earnedLeaveInDays: 10,
  casualLeaveInDays: 10,
  maternityLeaveInDays: 10,
  paternityLeaveInDays: 10,
};

const NO_OF_DAYS_OPTIONS: { value: NoOfDaysInMonthDtoEnum; label: string }[] = [
  { value: NoOfDaysInMonthDtoEnum.dynamic, label: 'Dynamic' },
  { value: NoOfDaysInMonthDtoEnum.thirty, label: '30 Days' },
  { value: NoOfDaysInMonthDtoEnum.thirtyOne, label: '31 Days' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization?: OrganizationResponseType | null;
  onSuccess: () => void;
}

const FORM_ID = 'organization-upsert-form';

export function OrganizationUpsertDrawer({ open, onOpenChange, organization, onSuccess }: Props) {
  const isEditing = !!organization;
  const [loading, setLoading] = useState(false);
  const [fetchingDetail, setFetchingDetail] = useState(false);
  const [error, setError] = useState('');
  const [logo, setLogo] = useState<UpsertMediaType | undefined>();
  const [documents, setDocuments] = useState<UpsertMediaType[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<OrganizationDocumentResponseType[]>([]);
  const [removeDocumentIds, setRemoveDocumentIds] = useState<number[]>([]);

  const createForm = useForm<CreateFormType>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: { name: '', email: '', settings: DEFAULT_SETTINGS },
  });

  const updateForm = useForm<UpdateFormType>({
    resolver: zodResolver(UpdateFormSchema),
    defaultValues: { name: '', settings: DEFAULT_SETTINGS },
  });

  useEffect(() => {
    if (open) {
      setError('');
      setLogo(undefined);
      setDocuments([]);
      setExistingDocuments([]);
      setRemoveDocumentIds([]);

      if (organization) {
        updateForm.reset({ name: organization.name, settings: DEFAULT_SETTINGS });
        setFetchingDetail(true);

        getOrganizationById(organization.id).then((result) => {
          setFetchingDetail(false);
          if (result.ok) {
            const detail = result.data;
            if (detail.settings) {
              updateForm.reset({
                name: organization.name,
                settings: {
                  noOfDaysInMonth: detail.settings.noOfDaysInMonth,
                  totalLeaveInDays: detail.settings.totalLeaveInDays,
                  sickLeaveInDays: detail.settings.sickLeaveInDays,
                  earnedLeaveInDays: detail.settings.earnedLeaveInDays,
                  casualLeaveInDays: detail.settings.casualLeaveInDays,
                  maternityLeaveInDays: detail.settings.maternityLeaveInDays,
                  paternityLeaveInDays: detail.settings.paternityLeaveInDays,
                },
              });
              setLogo({
                id: detail.settings.logo.id,
                key: detail.settings.logo.key,
                name: detail.settings.logo.name,
                type: detail.settings.logo.type,
              });
            }
            setExistingDocuments(detail.documents);
          }
        });
      } else {
        createForm.reset({ name: '', email: '', settings: DEFAULT_SETTINGS });
      }
    }
  }, [open, organization, createForm, updateForm]);

  const applyActionError = (error: { message: string; fieldErrors?: { field: string; message: string }[] }) => {
    if (error.fieldErrors?.length) {
      error.fieldErrors.forEach(({ field, message }) => {
        if (isEditing) {
          updateForm.setError(field as keyof UpdateFormType, { type: 'server', message });
        } else {
          createForm.setError(field as keyof CreateFormType, { type: 'server', message });
        }
      });
    } else {
      setError(error.message);
    }
  };

  const buildSettingsPayload = (data: CreateFormType | UpdateFormType) => {
    if (!logo) return undefined;
    return {
      noOfDaysInMonth: data.settings.noOfDaysInMonth,
      totalLeaveInDays: data.settings.totalLeaveInDays,
      sickLeaveInDays: data.settings.sickLeaveInDays,
      earnedLeaveInDays: data.settings.earnedLeaveInDays,
      casualLeaveInDays: data.settings.casualLeaveInDays,
      maternityLeaveInDays: data.settings.maternityLeaveInDays,
      paternityLeaveInDays: data.settings.paternityLeaveInDays,
      logo: {
        key: logo.key,
        name: logo.name,
        type: logo.type,
        id: logo.id,
      },
    };
  };

  const buildDocumentsPayload = () => {
    if (documents.length === 0) return undefined;
    return documents.map((doc) => ({
      key: doc.key,
      name: doc.name,
      type: doc.type,
      mediaType: doc.type === MediaTypeDtoEnum.image ? MediaTypeDtoEnum.image : MediaTypeDtoEnum.doc,
    }));
  };

  const handleCreateSubmit = async (data: CreateFormType) => {
    setLoading(true);
    setError('');
    try {
      const result = await createOrganization({
        name: data.name,
        email: data.email,
        settings: buildSettingsPayload(data),
        documents: buildDocumentsPayload(),
      });

      if (!result.ok) {
        applyActionError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (data: UpdateFormType) => {
    if (!organization) return;
    setLoading(true);
    setError('');
    try {
      const result = await updateOrganization(organization.id, {
        id: organization.id,
        name: data.name,
        settings: buildSettingsPayload(data),
        documents: buildDocumentsPayload(),
        removeDocumentIds: removeDocumentIds.length > 0 ? removeDocumentIds : undefined,
      });

      if (!result.ok) {
        applyActionError(result.error);
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExistingDocument = (doc: OrganizationDocumentResponseType) => {
    setRemoveDocumentIds((prev) => [...prev, doc.id]);
    setExistingDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSettingsFields = (form: UseFormReturn<any>) => (
    <div className='flex flex-col gap-4 rounded-lg border border-border p-4'>
      <span className='text-sm font-semibold'>Settings</span>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='noOfDaysInMonth'>No. of days in month</Label>
        <Controller
          name='settings.noOfDaysInMonth'
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent>
                {NO_OF_DAYS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col gap-2'>
          <Label>Total leave days</Label>
          <Input type='number' {...form.register('settings.totalLeaveInDays', { valueAsNumber: true })} />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Sick leave days</Label>
          <Input type='number' {...form.register('settings.sickLeaveInDays', { valueAsNumber: true })} />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Earned leave days</Label>
          <Input type='number' {...form.register('settings.earnedLeaveInDays', { valueAsNumber: true })} />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Casual leave days</Label>
          <Input type='number' {...form.register('settings.casualLeaveInDays', { valueAsNumber: true })} />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Maternity leave days</Label>
          <Input type='number' {...form.register('settings.maternityLeaveInDays', { valueAsNumber: true })} />
        </div>
        <div className='flex flex-col gap-2'>
          <Label>Paternity leave days</Label>
          <Input type='number' {...form.register('settings.paternityLeaveInDays', { valueAsNumber: true })} />
        </div>
      </div>
    </div>
  );

  const renderDocumentsSection = () => (
    <div className='flex flex-col gap-4 rounded-lg border border-border p-4'>
      <span className='text-sm font-semibold'>Documents</span>

      {existingDocuments.length > 0 && (
        <div className='flex flex-col gap-2'>
          <Label className='text-xs text-muted-foreground'>Existing documents</Label>
          {existingDocuments.map((doc) => (
            <div key={doc.id} className='flex items-center justify-between rounded-md border border-border px-3 py-2'>
              <span className='truncate text-sm'>{doc.document.name}</span>
              <button type='button' onClick={() => handleRemoveExistingDocument(doc)} className='text-muted-foreground hover:text-destructive'>
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className='flex flex-col gap-2'>
        <Label>Add documents</Label>
        <FileUpload
          isMultiple={true}
          media={documents}
          onUploaded={(val) => setDocuments((prev) => [...prev, val])}
          onRemove={(index) => setDocuments((prev) => prev.filter((_, i) => i !== index))}
          onError={(err) => err && setError(err)}
          previewFirst
        />
      </div>
    </div>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit organization' : 'New organization'}
      footer={
        <div className='flex justify-end gap-3'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type='submit' form={FORM_ID} disabled={loading || fetchingDetail}>
            {loading ? 'Saving...' : isEditing ? 'Save changes' : 'Create organization'}
          </Button>
        </div>
      }
    >
      {isEditing ? (
        <form id={FORM_ID} onSubmit={updateForm.handleSubmit(handleUpdateSubmit)} className='flex flex-col gap-6 p-6'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>Organization name</Label>
            <Input id='name' placeholder='e.g. Acme Corp' {...updateForm.register('name')} />
            {updateForm.formState.errors.name && <p className='text-sm text-destructive'>{updateForm.formState.errors.name.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Logo</Label>
            <ImageUpload
              isMultiple={false}
              media={logo ? [logo] : []}
              onUploaded={(val) => setLogo(val)}
              onRemove={() => setLogo(undefined)}
              onError={(err) => err && setError(err)}
              previewFirst
            />
          </div>

          {renderSettingsFields(updateForm)}
          {renderDocumentsSection()}
        </form>
      ) : (
        <form id={FORM_ID} onSubmit={createForm.handleSubmit(handleCreateSubmit)} className='flex flex-col gap-6 p-6'>
          {error && <p className='text-sm text-destructive'>{error}</p>}

          <div className='flex flex-col gap-2'>
            <Label htmlFor='name'>Organization name</Label>
            <Input id='name' placeholder='e.g. Acme Corp' {...createForm.register('name')} />
            {createForm.formState.errors.name && <p className='text-sm text-destructive'>{createForm.formState.errors.name.message}</p>}
          </div>

          <div className='flex flex-col gap-2'>
            <Label>Logo</Label>
            <ImageUpload
              isMultiple={false}
              media={logo ? [logo] : []}
              onUploaded={(val) => setLogo(val)}
              onRemove={() => setLogo(undefined)}
              onError={(err) => err && setError(err)}
              previewFirst
            />
          </div>

          <div className='flex flex-col gap-2'>
            <Label htmlFor='email'>Admin email</Label>
            <Input id='email' type='email' placeholder='admin@example.com' {...createForm.register('email')} />
            {createForm.formState.errors.email && <p className='text-sm text-destructive'>{createForm.formState.errors.email.message}</p>}
            <p className='text-xs text-muted-foreground'>This user will be invited as admin of the organization</p>
          </div>

          {renderSettingsFields(createForm)}
          {renderDocumentsSection()}
        </form>
      )}
    </Drawer>
  );
}
