import { SearchParamsSchema, SortDirectionDtoEnum, UserFilterRequestType } from '@repo/dto';
import { z } from 'zod';

import { UserData } from '@/feature/user/user-data';
import { userService } from '@/lib/service/user.service';

const PageSpecificSearchParamsSchema = SearchParamsSchema.extend({
  roles: z.union([z.string(), z.array(z.string())]).optional(),
});

interface Props {
  searchParams: Promise<z.infer<typeof PageSpecificSearchParamsSchema>>;
}

export default async function UserPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = PageSpecificSearchParamsSchema.parse(params);

  const filterRequest: UserFilterRequestType = {
    pagination: {
      page: validatedParams.page ? Number(validatedParams.page) : 1,
      limit: validatedParams.pageSize ? Number(validatedParams.pageSize) : 50,
    },
    search: validatedParams.search,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  if (validatedParams.status) {
    filterRequest.isActive = validatedParams.status === 'active';
  }

  const data = await userService.search(filterRequest);
  const stats = await userService.getStats();

  return (
    <div className='center-container flex h-full flex-col py-4'>
      {/* <UserList /> */}
      <UserData data={data} searchParams={validatedParams} stats={stats} />
    </div>
  );
}
