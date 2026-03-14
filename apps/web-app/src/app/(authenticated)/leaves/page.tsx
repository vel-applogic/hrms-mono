import { LeaveFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { LeaveData } from '@/feature/leave/leave-data';
import { leaveService } from '@/lib/service/leave.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeavesPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: LeaveFilterRequestType = {
    pagination: {
      page: validatedParams.page ?? 1,
      limit: validatedParams.pageSize ?? 50,
    },
    search: validatedParams.search,
    status: validatedParams.leaveStatus?.length
      ? (validatedParams.leaveStatus as LeaveFilterRequestType['status'])
      : undefined,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const data = await leaveService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <LeaveData data={data} searchParams={validatedParams} />
    </div>
  );
}
