import { EmployeeFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { EmployeeData } from '@/feature/employee/employee-data';
import { employeeService } from '@/lib/service/employee.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmployeePage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: EmployeeFilterRequestType = {
    pagination: {
      page: validatedParams.page ? Number(validatedParams.page) : 1,
      limit: validatedParams.pageSize ? Number(validatedParams.pageSize) : 50,
    },
    search: validatedParams.search,
    status: validatedParams.employeeStatus?.length ? (validatedParams.employeeStatus as EmployeeFilterRequestType['status']) : undefined,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const data = await employeeService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <EmployeeData data={data} searchParams={validatedParams} />
    </div>
  );
}
