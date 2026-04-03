import { z } from 'zod';

import { CountryResponseSchema } from './country.dto.js';

const AddressBaseFieldsSchema = z.object({
  countryId: z.number(),
  addressLine1: z.string().min(1, 'Address line 1 is required').trim(),
  addressLine2: z.string().trim(),
  city: z.string().min(1, 'City is required').trim(),
  state: z.string().min(1, 'State is required').trim(),
  postalCode: z.string().min(1, 'Postal code is required').trim(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const AddressUpsertSchema = AddressBaseFieldsSchema;
export type AddressUpsertType = z.infer<typeof AddressUpsertSchema>;

export const AddressResponseSchema = AddressBaseFieldsSchema.extend({
  id: z.number(),
  country: CountryResponseSchema,
});
export type AddressResponseType = z.infer<typeof AddressResponseSchema>;
