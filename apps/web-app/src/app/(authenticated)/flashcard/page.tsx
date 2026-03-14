import { FlashcardFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { FlashcardData } from '@/feature/flashcard/flashcard-data';
import { flashcardService } from '@/lib/service/flashcard.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function FlashcardPage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: FlashcardFilterRequestType = {
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

  const data = await flashcardService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <FlashcardData data={data} searchParams={validatedParams} />
    </div>
  );
}
