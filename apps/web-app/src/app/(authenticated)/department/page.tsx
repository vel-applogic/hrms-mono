import { redirect } from 'next/navigation';

import { DepartmentFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { DepartmentData } from '@/feature/department/department-data';
import { auth } from '@/lib/auth/auth';
import { departmentService } from '@/lib/service/department.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DepartmentPage(props: Props) {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/emp/dashboard');
  }

  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: DepartmentFilterRequestType = {
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

  const data = await departmentService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <DepartmentData data={data} searchParams={validatedParams} />
    </div>
  );
}
