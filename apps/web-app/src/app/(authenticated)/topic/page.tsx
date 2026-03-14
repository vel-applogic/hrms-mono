import { SearchParamsSchema, SortDirectionDtoEnum, TopicFilterRequestType } from '@repo/dto';

import { TopicListData } from '@/feature/topic/topic-list-data';
import { topicService } from '@/lib/service/topic.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TopicPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: TopicFilterRequestType = {
    pagination: {
      page: validatedParams.page ? Number(validatedParams.page) : 1,
      limit: validatedParams.pageSize ? Number(validatedParams.pageSize) : 50,
    },
    search: validatedParams.search,
    chapterId: validatedParams.chapterId,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const data = await topicService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <TopicListData data={data} searchParams={validatedParams} />
    </div>
  );
}
