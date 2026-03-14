import { z } from 'zod';

export const AppStatusTypeSchema = z.object({
  service: z.string(),
  status: z.boolean(),
  msg: z.array(z.string()),
});
export type AppStatusType = z.infer<typeof AppStatusTypeSchema>;

