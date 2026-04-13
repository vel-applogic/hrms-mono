import { AnnouncementFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { AnnouncementData } from '@/feature/announcement/announcement-data';
import { getBranchList } from '@/lib/action/branch.actions';
import { getDepartmentList } from '@/lib/action/department.actions';
import { announcementService } from '@/lib/service/announcement.service';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AnnouncementPage({ searchParams }: Props) {
  const parsed = SearchParamsSchema.parse(await searchParams);

  const filterRequest: AnnouncementFilterRequestType = {
    pagination: {
      page: parsed.page ?? 1,
      limit: parsed.pageSize ?? 50,
    },
    search: parsed.search,
  };

  if (parsed.sKey && parsed.sVal) {
    filterRequest.sort = { field: parsed.sKey, direction: parsed.sVal as SortDirectionDtoEnum };
  }

  const [data, branches, departments] = await Promise.all([announcementService.search(filterRequest), getBranchList(), getDepartmentList()]);

  return (
    <div className='flex h-full flex-col'>
      <AnnouncementData data={data} searchParams={parsed} branches={branches} departments={departments} />
    </div>
  );
}
