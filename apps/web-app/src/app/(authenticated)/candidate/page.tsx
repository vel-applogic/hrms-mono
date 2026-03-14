import { CandidateFilterRequestType, SearchParamsSchema, SortDirectionDtoEnum } from '@repo/dto';

import { CandidateData } from '@/feature/candidate/candidate-data';
import { candidateService } from '@/lib/service/candidate.service';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CandidatePage(props: Props) {
  const params = await props.searchParams;
  const validatedParams = SearchParamsSchema.parse(params);

  const filterRequest: CandidateFilterRequestType = {
    pagination: {
      page: validatedParams.page ? Number(validatedParams.page) : 1,
      limit: validatedParams.pageSize ? Number(validatedParams.pageSize) : 50,
    },
    search: validatedParams.search,
    status: validatedParams.candidateStatus?.length ? (validatedParams.candidateStatus as CandidateFilterRequestType['status']) : undefined,
    progress: validatedParams.candidateProgress?.length ? (validatedParams.candidateProgress as CandidateFilterRequestType['progress']) : undefined,
    source: validatedParams.candidateSource?.length ? (validatedParams.candidateSource as CandidateFilterRequestType['source']) : undefined,
  };

  if (validatedParams.sKey && validatedParams.sVal) {
    filterRequest.sort = {
      field: validatedParams.sKey,
      direction: validatedParams.sVal as SortDirectionDtoEnum,
    };
  }

  const data = await candidateService.search(filterRequest);

  return (
    <div className='flex h-full flex-col'>
      <CandidateData data={data} searchParams={validatedParams} />
    </div>
  );
}
