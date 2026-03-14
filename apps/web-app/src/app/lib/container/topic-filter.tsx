'use client';

import { TopicListResponseType } from '@repo/dto';
import { SelectOption, SelectSearchSingle } from '@repo/ui/component/select-search';
import { useEffect, useState } from 'react';

import { getTopicsList } from '@/lib/action/topic.actions';

interface TopicFilterProps {
  chapterId?: number;
  value?: number;
  onChange: (topicId: number | undefined) => void;
}

export function TopicFilter({ chapterId, value, onChange }: TopicFilterProps) {
  const [topics, setTopics] = useState<TopicListResponseType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!chapterId) {
      setTopics([]);
      return;
    }

    setLoading(true);
    getTopicsList(chapterId)
      .then(setTopics)
      .finally(() => setLoading(false));
  }, [chapterId]);

  const options: SelectOption[] = topics.map((t) => ({ label: t.title, value: String(t.id) }));

  const handleChange = (val: string) => {
    onChange(val ? Number(val) : undefined);
  };

  return (
    <SelectSearchSingle
      value={value ? String(value) : undefined}
      options={options}
      placeholder='Topic'
      searchPlaceholder='Search topics...'
      onChange={handleChange}
      onClear={() => onChange(undefined)}
      disabled={loading || !chapterId}
      className='w-[200px]'
    />
  );
}
