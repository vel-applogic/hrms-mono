'use server';

import type { DashboardStatsResponseType } from '@repo/dto';

import { dashboardService } from '@/lib/service/dashboard.service';

export async function getDashboardStats(): Promise<DashboardStatsResponseType> {
  return dashboardService.getStats();
}
