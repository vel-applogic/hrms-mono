import { z } from 'zod';

export const DashboardStatsResponseSchema = z.object({
  candidateCountByStatus: z.array(z.object({ status: z.string(), count: z.number() })),
  employeeCountByStatus: z.array(z.object({ status: z.string(), count: z.number() })),
  employeesWithoutReportTo: z.number(),
  employeesWithoutCompensation: z.number(),
  employeesWithoutDeduction: z.number(),
});
export type DashboardStatsResponseType = z.infer<typeof DashboardStatsResponseSchema>;
