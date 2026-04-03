import { z } from 'zod';

import { ContactTypeDtoEnum } from './enum.js';

const ContactBaseFieldsSchema = z.object({
  contact: z.string().min(1, 'Contact is required').trim(),
  contactType: z.enum(ContactTypeDtoEnum),
});

export const ContactUpsertSchema = ContactBaseFieldsSchema.extend({
  id: z.number().optional(),
});
export type ContactUpsertType = z.infer<typeof ContactUpsertSchema>;

export const ContactResponseSchema = ContactBaseFieldsSchema.extend({
  id: z.number(),
});
export type ContactResponseType = z.infer<typeof ContactResponseSchema>;
