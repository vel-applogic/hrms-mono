'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ContactTypeDtoEnum,
  CountryResponseType,
  CurrencyResponseType,
  MediaTypeDtoEnum,
  NoOfDaysInMonthDtoEnum,
  ContactResponseType,
  OrganizationDocumentResponseType,
  OrganizationResponseType,
  UpsertMediaType,
} from '@repo/dto';
import { contactTypeDtoEnumToReadableLabel } from '@repo/shared';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { Label } from '@repo/ui/component/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/component/ui/select';
import { SelectSearchSingle } from '@repo/ui/component/select-search';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, UseFormReturn, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { FileUpload, ImageUpload } from '@/container/s3-file-upload/s3-file-upload';
import { createOrganization, getOrganizationById, listCountries, listCurrencies, updateOrganization } from '@/lib/action/organization.actions';

const SettingsSchema = z.object({
  noOfDaysInMonth: z.nativeEnum(NoOfDaysInMonthDtoEnum),
  totalLeaveInDays: z.number().int().min(0),
  sickLeaveInDays: z.number().int().min(0),
  earnedLeaveInDays: z.number().int().min(0),
  casualLeaveInDays: z.number().int().min(0),
  maternityLeaveInDays: z.number().int().min(0),
  paternityLeaveInDays: z.number().int().min(0),
  weeklyOffDays: z.array(z.number().int().min(0).max(6)),
});

const WEEK_DAY_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const AddressSchema = z.object({
  countryId: z.number({ error: 'Country is required' }),
  addressLine1: z.string().min(1, 'Address line 1 is required').trim(),
  addressLine2: z.string().trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
});

const ContactSchema = z.object({
  id: z.number().optional(),
  contact: z.string().min(1, 'Contact is required').trim(),
  contactType: z.nativeEnum(ContactTypeDtoEnum),
});

const BaseFormSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  currencyId: z.number({ error: 'Currency is required' }),
  settings: SettingsSchema,
  address: AddressSchema.optional(),
  contacts: z.array(ContactSchema),
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
  weeklyOffDays: [0, 6],
};

const DEFAULT_ADDRESS = {
  countryId: undefined as unknown as number,
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
};

const NO_OF_DAYS_OPTIONS: { value: NoOfDaysInMonthDtoEnum; label: string }[] = [
  { value: NoOfDaysInMonthDtoEnum.dynamic, label: 'Dynamic' },
  { value: NoOfDaysInMonthDtoEnum.thirty, label: '30 Days' },
  { value: NoOfDaysInMonthDtoEnum.thirtyOne, label: '31 Days' },
];

const CONTACT_TYPE_OPTIONS = Object.values(ContactTypeDtoEnum).map((value) => ({
  value,
  label: contactTypeDtoEnumToReadableLabel(value),
}));

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
  const [removeContactIds, setRemoveContactIds] = useState<number[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyResponseType[]>([]);
  const [countries, setCountries] = useState<CountryResponseType[]>([]);
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    Promise.all([listCurrencies(), listCountries()]).then(([c, co]) => {
      setCurrencies(c);
      setCountries(co);
    }).catch(() => {});
  }, []);

  const createForm = useForm<CreateFormType>({
    resolver: zodResolver(CreateFormSchema),
    defaultValues: { name: '', email: '', settings: DEFAULT_SETTINGS, contacts: [] },
  });

  const updateForm = useForm<UpdateFormType>({
    resolver: zodResolver(UpdateFormSchema),
    defaultValues: { name: '', settings: DEFAULT_SETTINGS, contacts: [] },
  });

  const createContactsField = useFieldArray({ control: createForm.control, name: 'contacts' });
  const updateContactsField = useFieldArray({ control: updateForm.control, name: 'contacts' });

  useEffect(() => {
    if (open) {
      setError('');
      setLogo(undefined);
      setDocuments([]);
      setExistingDocuments([]);
      setRemoveDocumentIds([]);
      setRemoveContactIds([]);
      setShowAddress(false);

      if (organization) {
        updateForm.reset({ name: organization.name, currencyId: organization.currency.id, settings: DEFAULT_SETTINGS, contacts: [] });
        setFetchingDetail(true);

        getOrganizationById(organization.id).then((result) => {
          setFetchingDetail(false);
          if (result.ok) {
            const detail = result.data;
            const formData: UpdateFormType = {
              name: organization.name,
              currencyId: detail.currency.id,
              settings: detail.settings ? {
                noOfDaysInMonth: detail.settings.noOfDaysInMonth,
                totalLeaveInDays: detail.settings.totalLeaveInDays,
                sickLeaveInDays: detail.settings.sickLeaveInDays,
                earnedLeaveInDays: detail.settings.earnedLeaveInDays,
                casualLeaveInDays: detail.settings.casualLeaveInDays,
                maternityLeaveInDays: detail.settings.maternityLeaveInDays,
                paternityLeaveInDays: detail.settings.paternityLeaveInDays,
                weeklyOffDays: detail.settings.weeklyOffDays,
              } : DEFAULT_SETTINGS,
              contacts: detail.contacts.map((c: ContactResponseType) => ({
                id: c.id,
                contact: c.contact,
                contactType: c.contactType,
              })),
            };

            if (detail.address) {
              formData.address = {
                countryId: detail.address.countryId,
                addressLine1: detail.address.addressLine1,
                addressLine2: detail.address.addressLine2,
                city: detail.address.city,
                state: detail.address.state,
                postalCode: detail.address.postalCode,
              };
              setShowAddress(true);
            }

            updateForm.reset(formData);

            if (detail.logo) {
              setLogo({
                id: detail.logo.id,
                key: detail.logo.key,
                name: detail.logo.name,
                type: detail.logo.type,
              });
            }
            setExistingDocuments(detail.documents);
          }
        });
      } else {
        createForm.reset({ name: '', email: '', settings: DEFAULT_SETTINGS, contacts: [] });
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

  const buildLogoPayload = () => {
    if (!logo) return undefined;
    return {
      key: logo.key,
      name: logo.name,
      type: logo.type,
      id: logo.id,
    };
  };

  const buildSettingsPayload = (data: CreateFormType | UpdateFormType) => {
    return {
      noOfDaysInMonth: data.settings.noOfDaysInMonth,
      totalLeaveInDays: data.settings.totalLeaveInDays,
      sickLeaveInDays: data.settings.sickLeaveInDays,
      earnedLeaveInDays: data.settings.earnedLeaveInDays,
      casualLeaveInDays: data.settings.casualLeaveInDays,
      maternityLeaveInDays: data.settings.maternityLeaveInDays,
      paternityLeaveInDays: data.settings.paternityLeaveInDays,
      weeklyOffDays: data.settings.weeklyOffDays,
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

  const buildContactsPayload = (data: CreateFormType | UpdateFormType) => {
    if (data.contacts.length === 0) return undefined;
    return data.contacts.map((c) => ({
      id: c.id,
      contact: c.contact,
      contactType: c.contactType,
    }));
  };

  const buildAddressPayload = (data: CreateFormType | UpdateFormType) => {
    if (!data.address || !showAddress) return undefined;
    return {
      countryId: data.address.countryId,
      addressLine1: data.address.addressLine1,
      addressLine2: data.address.addressLine2,
      city: data.address.city,
      state: data.address.state,
      postalCode: data.address.postalCode,
    };
  };

  const handleCreateSubmit = async (data: CreateFormType) => {
    setLoading(true);
    setError('');
    try {
      const result = await createOrganization({
        name: data.name,
        email: data.email,
        currencyId: data.currencyId,
        logo: buildLogoPayload(),
        settings: buildSettingsPayload(data),
        documents: buildDocumentsPayload(),
        address: buildAddressPayload(data),
        contacts: buildContactsPayload(data),
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
        currencyId: data.currencyId,
        logo: buildLogoPayload(),
        settings: buildSettingsPayload(data),
        documents: buildDocumentsPayload(),
        removeDocumentIds: removeDocumentIds.length > 0 ? removeDocumentIds : undefined,
        address: buildAddressPayload(data),
        contacts: buildContactsPayload(data),
        removeContactIds: removeContactIds.length > 0 ? removeContactIds : undefined,
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

  const currencyOptions = currencies.map((c) => ({
    value: String(c.id),
    label: c.symbol ? `${c.symbol} - ${c.name} (${c.code})` : `${c.name} (${c.code})`,
    keywords: [c.code, c.name, c.symbol ?? ''],
  }));

  const countryOptions = countries.map((c) => ({
    value: String(c.id),
    label: `${c.name} (${c.code})`,
    keywords: [c.code, c.name],
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCurrencyField = (form: UseFormReturn<any>) => (
    <div className='flex flex-col gap-2'>
      <Label htmlFor='currencyId'>Currency</Label>
      <Controller
        name='currencyId'
        control={form.control}
        render={({ field }) => (
          <SelectSearchSingle
            value={field.value != null ? String(field.value) : undefined}
            options={currencyOptions}
            placeholder='Select currency'
            searchPlaceholder='Search currency...'
            onChange={(v) => field.onChange(Number(v))}
          />
        )}
      />
      {form.formState.errors.currencyId && (
        <p className='text-sm text-destructive'>{form.formState.errors.currencyId.message as string}</p>
      )}
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderSettingsFields = (form: UseFormReturn<any>) => (
    <div className='flex flex-col gap-4 rounded-lg border border-muted-foreground/30 p-4'>
      <span className='text-sm font-semibold'>Leave settings</span>

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderWeekoffFields = (form: UseFormReturn<any>) => (
    <div className='flex flex-col gap-4 rounded-lg border border-muted-foreground/30 p-4'>
      <span className='text-sm font-semibold'>Weekoff days</span>
      <Controller
        name='settings.weeklyOffDays'
        control={form.control}
        render={({ field }) => {
          const selected: number[] = Array.isArray(field.value) ? field.value : [];
          const toggle = (day: number) => {
            const next = selected.includes(day) ? selected.filter((d) => d !== day) : [...selected, day];
            field.onChange(next.sort((a, b) => a - b));
          };
          return (
            <div className='flex flex-wrap gap-2'>
              {WEEK_DAY_OPTIONS.map((opt) => {
                const isActive = selected.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => toggle(opt.value)}
                    className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );

  const renderAddressFields = (form: UseFormReturn<CreateFormType> | UseFormReturn<UpdateFormType>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = form as UseFormReturn<any>;
    const addressErrors = f.formState.errors.address as Record<string, { message?: string }> | undefined;

    return (
      <div className='flex flex-col gap-4 rounded-lg border border-muted-foreground/30 p-4'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-semibold'>Address</span>
          {!showAddress && (
            <Button type='button' variant='outline' size='sm' onClick={() => {
              setShowAddress(true);
              f.setValue('address', DEFAULT_ADDRESS);
            }}>
              <Plus className='mr-1 h-3 w-3' /> Add address
            </Button>
          )}
        </div>

        {showAddress && (
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
              <Label>Country</Label>
              <Controller
                name='address.countryId'
                control={f.control}
                render={({ field }) => (
                  <SelectSearchSingle
                    value={field.value != null ? String(field.value) : undefined}
                    options={countryOptions}
                    placeholder='Select country'
                    searchPlaceholder='Search country...'
                    onChange={(v) => field.onChange(Number(v))}
                  />
                )}
              />
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Address line 1</Label>
              <Input {...f.register('address.addressLine1')} placeholder='Street address' />
              {addressErrors?.addressLine1 && (
                <p className='text-sm text-destructive'>{addressErrors.addressLine1.message}</p>
              )}
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Address line 2</Label>
              <Input {...f.register('address.addressLine2')} placeholder='Apt, suite, etc.' />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2'>
                <Label>City</Label>
                <Input {...f.register('address.city')} placeholder='City' />
                {addressErrors?.city && (
                  <p className='text-sm text-destructive'>{addressErrors.city.message}</p>
                )}
              </div>
              <div className='flex flex-col gap-2'>
                <Label>State</Label>
                <Input {...f.register('address.state')} placeholder='State' />
                {addressErrors?.state && (
                  <p className='text-sm text-destructive'>{addressErrors.state.message}</p>
                )}
              </div>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Postal code</Label>
              <Input {...f.register('address.postalCode')} placeholder='Postal code' />
              {addressErrors?.postalCode && (
                <p className='text-sm text-destructive'>{addressErrors.postalCode.message}</p>
              )}
            </div>

            <Button type='button' variant='ghost' size='sm' className='self-end text-destructive' onClick={() => {
              setShowAddress(false);
              f.setValue('address', undefined);
            }}>
              <Trash2 className='mr-1 h-3 w-3' /> Remove address
            </Button>
          </div>
        )}
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderContactsFields = (form: UseFormReturn<any>, contactsFieldArray: any) => (
    <div className='flex flex-col gap-4 rounded-lg border border-muted-foreground/30 p-4'>
      <div className='flex items-center justify-between'>
        <span className='text-sm font-semibold'>Contacts</span>
        <Button type='button' variant='outline' size='sm' onClick={() => contactsFieldArray.append({ contact: '', contactType: ContactTypeDtoEnum.phone })}>
          <Plus className='mr-1 h-3 w-3' /> Add contact
        </Button>
      </div>

      {contactsFieldArray.fields.map((field: Record<string, string>, index: number) => (
        <div key={field.id} className='flex items-start gap-3 rounded-md border border-muted-foreground/30 p-3'>
          <div className='flex flex-1 flex-col gap-3'>
            <div className='flex flex-col gap-2'>
              <Label>Type</Label>
              <Controller
                name={`contacts.${index}.contactType`}
                control={form.control}
                render={({ field: selectField }) => (
                  <Select value={selectField.value} onValueChange={selectField.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className='flex flex-col gap-2'>
              <Label>Contact</Label>
              <Input {...form.register(`contacts.${index}.contact`)} placeholder='Enter contact' />
            </div>
          </div>
          <button
            type='button'
            onClick={() => {
              const contactId = form.getValues(`contacts.${index}.id`);
              if (contactId) {
                setRemoveContactIds((prev) => [...prev, contactId as number]);
              }
              contactsFieldArray.remove(index);
            }}
            className='mt-7 text-destructive hover:text-destructive/80'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      ))}

      {contactsFieldArray.fields.length === 0 && (
        <p className='text-sm text-muted-foreground'>No contacts added</p>
      )}
    </div>
  );

  const renderDocumentsSection = () => (
    <div className='flex flex-col gap-4 rounded-lg border border-muted-foreground/30 p-4'>
      <span className='text-sm font-semibold'>Documents</span>

      {existingDocuments.length > 0 && (
        <div className='flex flex-col gap-2'>
          <Label className='text-xs text-muted-foreground'>Existing documents</Label>
          {existingDocuments.map((doc) => (
            <div key={doc.id} className='flex items-center justify-between rounded-md border border-muted-foreground/30 px-3 py-2'>
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

          {renderCurrencyField(updateForm)}

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

          {renderAddressFields(updateForm)}
          {renderContactsFields(updateForm, updateContactsField)}
          {renderSettingsFields(updateForm)}
          {renderWeekoffFields(updateForm)}
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

          {renderCurrencyField(createForm)}

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

          {renderAddressFields(createForm)}
          {renderContactsFields(createForm, createContactsField)}
          {renderSettingsFields(createForm)}
          {renderWeekoffFields(createForm)}
          {renderDocumentsSection()}
        </form>
      )}
    </Drawer>
  );
}
