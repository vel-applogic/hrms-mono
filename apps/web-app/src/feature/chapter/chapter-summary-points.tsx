interface Props {
  summaryPoints: string[];
}

export function ChapterSummaryPoints({ summaryPoints }: Props) {
  if (summaryPoints.length === 0) return null;

  return (
    <div className='flex flex-col gap-3'>
      <span className='text-base font-medium text-white'>Summary Points</span>
      <div className='grid grid-cols-2 gap-3'>
        {summaryPoints.map((point, index) => (
          <div key={index} className='flex items-center gap-1.5'>
            <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded border border-border text-xs font-medium text-muted-foreground'>{index + 1}</span>
            <div className='flex min-h-[2.25rem] flex-1 items-center rounded-xl border border-border bg-background px-4 py-3'>
              <span className='text-sm text-white'>{point}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
