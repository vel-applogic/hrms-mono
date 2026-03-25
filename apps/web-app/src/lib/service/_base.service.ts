import { UnAuthenticatedError } from '@repo/ui/lib/axios/axios-error';
import { AxiosInstance } from '@repo/ui/lib/axios/axios-instance';
import { BaseAxiosService } from '@repo/ui/lib/axios/base.service';

import { auth } from '@/lib/auth/auth';

export class BaseService extends BaseAxiosService {
  constructor(apiService: AxiosInstance) {
    super(apiService);
  }

  async getAuthHeaderInfo(): Promise<{ userId: number; organizationId: number }> {
    const session = await auth();
    const user = session?.user;
    const userId = user?.id ? Number(user.id) : undefined;
    if (!userId) {
      throw new UnAuthenticatedError('You should be logged in to perform this request');
    }
    const organizationId = user?.organizationId ?? 0;
    return { userId, organizationId };
  }
}
