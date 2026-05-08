import { redirect } from 'next/navigation';

import { OrganisationFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { OrganisationData } from '@/feature/organisation/organisation-data';
import { auth } from '@/lib/auth/auth';
import { organisationService } from '@/lib/service/organisation.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrganisationPage(props: Props) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin) {
    redirect('/employee');
  }

  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: OrganisationFilterRequestType = {
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

  const data = await organisationService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <OrganisationData data={data} searchParams={validatedParams} />
    </div>
  );
}
