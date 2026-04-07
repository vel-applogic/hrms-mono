'use client';

import type { PolicyDetailResponseType } from '@repo/dto';
import { MarkdownViewer } from '@repo/ui/component/markdown-viewer';
import { Button } from '@repo/ui/component/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { getSignedUrlForViewAction } from '@/container/s3-file-upload/action';

interface ContentItem {
  type: 'text' | 'image';
  content?: string;
  image?: { key: string; name: string };
}

function parseContent(raw: string): ContentItem[] {
  try {
    const parsed = JSON.parse(raw) as { list: ContentItem[] };
    return parsed.list ?? [];
  } catch {
    return [];
  }
}

async function resolveImageKey(key: string): Promise<string> {
  const result = await getSignedUrlForViewAction({ key });
  return result.url;
}

interface Props {
  policy: PolicyDetailResponseType;
  backHref: string;
}

export function PolicyViewPage({ policy, backHref }: Props) {
  const items = parseContent(policy.content);

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-center gap-3'>
        <Link href={backHref}>
          <Button variant='ghost' size='icon' className='shrink-0'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <h1 className='text-xl font-medium tracking-tight text-foreground'>{policy.title}</h1>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 pb-8'>
        <div className='mx-auto w-full max-w-[816px] rounded-lg border border-border bg-white px-16 py-14 shadow-[0_2px_12px_rgba(0,0,0,0.08)]'>
          <h1 className='mb-8 text-center text-2xl font-bold text-foreground'>{policy.title}</h1>

          <div className='flex flex-col gap-6'>
            {items.map((item, index) => {
              if (item.type === 'text' && item.content) {
                return <MarkdownViewer key={index} value={item.content} onResolveImageKey={resolveImageKey} />;
              }
              return null;
            })}

            {items.length === 0 && <p className='text-center text-sm text-muted-foreground'>No content.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
