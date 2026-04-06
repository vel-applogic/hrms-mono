'use client';

import { CandidateStatusDtoEnum } from '@repo/dto';
import { DashboardWidgetStat } from '@repo/ui/component/ui/dashboard-widget';
import { UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getCandidatesList } from '@/lib/action/candidate.actions';

export function DashboardCandidateCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getCandidatesList().then((candidates) => {
      setCount(candidates.filter((c) => c.status === CandidateStatusDtoEnum.new).length);
    });
  }, []);

  return <DashboardWidgetStat icon={UserRound} label='New Candidates' value={count} valueColor='text-sky-600' href='/candidate' />;
}
