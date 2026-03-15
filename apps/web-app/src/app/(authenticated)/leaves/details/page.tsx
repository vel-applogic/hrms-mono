import { LeaveFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';
import { getFinancialYearCode, getLastFinancialYearCodes } from '@repo/shared';

import { LeaveData } from '@/feature/leave/leave-data';
import { employeeService } from '@/lib/service/employee.service';
import { leaveService } from '@/lib/service/leave.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LeavesDetailsPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const defaultFinancialYear = getFinancialYearCode(new Date());

  const filterRequest: LeaveFilterRequestType = {
    pagination: {
      page: validatedParams.page ?? 1,
      limit: validatedParams.pageSize ?? 50,
    },
    search: validatedParams.search,
    status: validatedParams.leaveStatus?.length
      ? (validatedParams.leaveStatus as LeaveFilterRequestType['status'])
      : undefined,
    financialYear: validatedParams.financialYear ?? defaultFinancialYear,
    userId: validatedParams.userId?.length ? validatedParams.userId : undefined,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const [data, employeesRes] = await Promise.all([
    leaveService.search(filterRequest),
    employeeService.search({
      pagination: { page: 1, limit: 500 },
    }),
  ]);

  const employees = employeesRes.results.map((e) => ({
    id: e.id,
    label: `${e.firstname} ${e.lastname}`,
    value: String(e.id),
  }));

  return (
    <div className='flex h-full flex-col'>
      <LeaveData
        data={data}
        employees={employees}
        searchParams={validatedParams}
        defaultFinancialYear={defaultFinancialYear}
        financialYearOptions={getLastFinancialYearCodes(3).map((code) => ({ value: code, label: code }))}
      />
    </div>
  );
}
