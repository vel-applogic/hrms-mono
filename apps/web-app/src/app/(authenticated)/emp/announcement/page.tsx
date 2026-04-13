import { AnnouncementFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { AnnouncementData } from '@/feature/announcement/announcement-data';
import { announcementService } from '@/lib/service/announcement.service';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmpAnnouncementPage({ searchParams }: Props) {
  const parsed = SearchParamsSchema.parse(await searchParams);

  const filterRequest: AnnouncementFilterRequestType = {
    pagination: {
      page: parsed.page ?? 1,
      limit: parsed.pageSize ?? 50,
    },
    search: parsed.search,
    isPublished: true,
  };

  if (parsed.sKey && parsed.sVal) {
    filterRequest.sort = { field: parsed.sKey, direction: parsed.sVal as SortDirectionDtoEnum };
  }

  const data = await announcementService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <AnnouncementData data={data} searchParams={parsed} branches={[]} departments={[]} readOnly />
    </div>
  );
}
