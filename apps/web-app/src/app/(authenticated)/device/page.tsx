import { SearchParamsSchema, DeviceFilterRequestType, SortDirectionDtoEnum } from '@repo/dto';

import { DeviceData } from '@/feature/device/device-data';
import { deviceService } from '@/lib/service/device.service';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DevicePage({ searchParams }: Props) {
  const deviceSearchParams = SearchParamsSchema.parse(await searchParams);

  const deviceFilterRequest: DeviceFilterRequestType = {
    pagination: {
      page: deviceSearchParams.page ?? 1,
      limit: deviceSearchParams.pageSize ?? 50,
    },
    search: deviceSearchParams.search,
  };

  if (deviceSearchParams.sKey && deviceSearchParams.sVal) {
    deviceFilterRequest.sort = { field: deviceSearchParams.sKey, direction: deviceSearchParams.sVal as SortDirectionDtoEnum };
  }

  if (deviceSearchParams.userId && deviceSearchParams.userId.length > 0) {
    deviceFilterRequest.assignedToIds = deviceSearchParams.userId;
  }

  const data = await deviceService.search(deviceFilterRequest);

  return (
    <div className='flex h-full flex-col'>
      <DeviceData data={data} searchParams={deviceSearchParams} />
    </div>
  );
}
