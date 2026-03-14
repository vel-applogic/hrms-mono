import { SearchParamsSchema, SlideFilterRequestType, SortDirectionDtoEnum } from '@repo/dto';

import { SlideData } from '@/feature/slide/slide-data';
import { slideService } from '@/lib/service/slide.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SlidePage({ searchParams }: Props) {
  const slideSearchParams = SearchParamsSchema.parse(await searchParams);

  const slideFilterRequest: SlideFilterRequestType = {
    pagination: {
      page: slideSearchParams.page ?? 1,
      limit: slideSearchParams.pageSize ?? 50,
    },
    search: slideSearchParams.search,
    chapterId: slideSearchParams.chapterId,
    topicId: slideSearchParams.topicId,
    themeIds: slideSearchParams.themeIds,
  };

  if (slideSearchParams.sKey && slideSearchParams.sVal) {
    slideFilterRequest.sort = { field: slideSearchParams.sKey, direction: slideSearchParams.sVal as SortDirectionDtoEnum };
  }

  const slidesData = await slideService.search(slideFilterRequest);

  return (
    <div className='flex h-full flex-col'>
      <SlideData data={slidesData} searchParams={slideSearchParams} />
    </div>
  );
}
