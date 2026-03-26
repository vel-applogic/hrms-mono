import { redirect } from 'next/navigation';

import { OrganizationFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { OrganizationData } from '@/feature/organization/organization-data';
import { auth } from '@/lib/auth/auth';
import { organizationService } from '@/lib/service/organization.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrganizationPage(props: Props) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    redirect('/employee');
  }

  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: OrganizationFilterRequestType = {
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

  const data = await organizationService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <OrganizationData data={data} searchParams={validatedParams} />
    </div>
  );
}
