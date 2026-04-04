import { SearchParamsSchema } from '@repo/dto';

import { HolidayData } from '@/feature/holiday/holiday-data';
import { getHolidayYears, searchHolidays } from '@/lib/action/holiday.actions';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmpHolidayPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const currentYear = new Date().getFullYear();
  const yearParam = params.year ? Number(params.year) : currentYear;

  const [data, years] = await Promise.all([
    searchHolidays({
      pagination: {
        page: validatedParams.page ?? 1,
        limit: validatedParams.pageSize ?? 50,
      },
      search: validatedParams.search,
      year: yearParam,
    }),
    getHolidayYears(),
  ]);

  const yearOptions = years.length > 0 ? years : [currentYear];
  if (!yearOptions.includes(currentYear)) {
    yearOptions.push(currentYear);
    yearOptions.sort((a, b) => b - a);
  }

  return (
    <div className='flex h-full flex-col'>
      <HolidayData data={data} searchParams={validatedParams} years={yearOptions} selectedYear={yearParam} readOnly />
    </div>
  );
}
