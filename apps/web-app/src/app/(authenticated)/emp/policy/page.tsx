import { SearchParamsSchema, PolicyFilterRequestType, SortDirectionDtoEnum } from '@repo/dto';

import { PolicyData } from '@/feature/policy/policy-data';
import { policyService } from '@/lib/service/policy.service';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmpPolicyPage({ searchParams }: Props) {
  const policySearchParams = SearchParamsSchema.parse(await searchParams);

  const policyFilterRequest: PolicyFilterRequestType = {
    pagination: {
      page: policySearchParams.page ?? 1,
      limit: policySearchParams.pageSize ?? 50,
    },
    search: policySearchParams.search,
  };

  if (policySearchParams.sKey && policySearchParams.sVal) {
    policyFilterRequest.sort = { field: policySearchParams.sKey, direction: policySearchParams.sVal as SortDirectionDtoEnum };
  }

  const data = await policyService.search(policyFilterRequest);

  return (
    <div className='flex h-full flex-col'>
      <PolicyData data={data} searchParams={policySearchParams} readOnly basePath='/emp/policy' />
    </div>
  );
}
