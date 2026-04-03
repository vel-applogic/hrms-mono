import { z } from 'zod';

export const CurrencyResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  symbol: z.string().nullable(),
});
export type CurrencyResponseType = z.infer<typeof CurrencyResponseSchema>;
