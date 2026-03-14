import { QuestionFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { QuestionListData } from '@/feature/question/question-list';
import { questionService } from '@/lib/service/question.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function QuestionPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: QuestionFilterRequestType = {
    pagination: {
      page: validatedParams.page ?? 1,
      limit: validatedParams.pageSize ?? 50,
    },
    search: validatedParams.search,
    chapterId: validatedParams.chapterId,
    topicId: validatedParams.topicId,
    themeIds: validatedParams.themeIds,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const data = await questionService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <QuestionListData data={data} searchParams={validatedParams} />
    </div>
  );
}
