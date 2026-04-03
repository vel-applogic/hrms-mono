import { z } from 'zod';

export const CountryResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
});
export type CountryResponseType = z.infer<typeof CountryResponseSchema>;
