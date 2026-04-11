import type { DashboardStatsResponseType } from '@repo/dto';
import { DashboardStatsResponseSchema } from '@repo/dto';
import { CreateAxiosInstance } from '@repo/ui/lib/axios/axios-instance';

import { BaseService } from './_base.service';

class DashboardService extends BaseService {
  constructor() {
    super(CreateAxiosInstance(process.env.NEXT_PUBLIC_API_URL_ADMIN!));
  }

  async getStats(): Promise<DashboardStatsResponseType> {
    return this.get<DashboardStatsResponseType>({
      url: '/api/dashboard/stats',
      responseSchema: DashboardStatsResponseSchema,
    });
  }
}

export const dashboardService = new DashboardService();
