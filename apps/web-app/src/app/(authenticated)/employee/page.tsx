import { redirect } from 'next/navigation';

import { EmployeeFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { EmployeeData } from '@/feature/employee/employee-data';
import { auth } from '@/lib/auth/auth';
import { branchService } from '@/lib/service/branch.service';
import { departmentService } from '@/lib/service/department.service';
import { employeeService } from '@/lib/service/employee.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmployeePage(props: Props) {
  const session = await auth();
  const isSuperAdmin = session?.user?.isSuperAdmin ?? false;
  const roles = session?.user?.roles ?? [];
  if (!isSuperAdmin && !roles.includes('admin')) {
    redirect('/emp/dashboard');
  }
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: EmployeeFilterRequestType = {
    pagination: {
      page: validatedParams.page ? Number(validatedParams.page) : 1,
      limit: validatedParams.pageSize ? Number(validatedParams.pageSize) : 50,
    },
    search: validatedParams.search,
    status: validatedParams.employeeStatus?.length ? (validatedParams.employeeStatus as EmployeeFilterRequestType['status']) : undefined,
    branchIds: validatedParams.branchIds?.length ? validatedParams.branchIds : undefined,
    departmentIds: validatedParams.departmentIds?.length ? validatedParams.departmentIds : undefined,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const [data, branchData, departmentData] = await Promise.all([
    employeeService.search(filterRequest),
    branchService.search({ pagination: { page: 1, limit: 500 } }),
    departmentService.search({ pagination: { page: 1, limit: 500 } }),
  ]);

  return (
    <div className='flex h-full flex-col'>
      <EmployeeData
        data={data}
        searchParams={validatedParams}
        branches={branchData.results}
        departments={departmentData.results}
      />
    </div>
  );
}
