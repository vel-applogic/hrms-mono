import { FilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { ChapterData } from '@/feature/chapter/chapter-data';
import { chapterService } from '@/lib/service/chapter.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ChapterPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: FilterRequestType = {
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

  const data = await chapterService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <ChapterData data={data} searchParams={validatedParams} />
    </div>
  );
}
