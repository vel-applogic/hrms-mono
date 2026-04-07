'use client';

import type { PolicyCreateRequestType, PolicyDetailResponseType } from '@repo/dto';
import { MarkdownEditor } from '@repo/ui/component/markdown-editor';
import { Button } from '@repo/ui/component/ui/button';
import { Input } from '@repo/ui/component/ui/input';
import { ArrowLeft, Check, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { getSignedUrlForUploadAction, getSignedUrlForViewAction } from '@/container/s3-file-upload/action';
import { createPolicy, updatePolicy } from '@/lib/action/policy.actions';

import axios from 'axios';

interface ContentItem {
  type: 'text' | 'image';
  content?: string;
  image?: { key: string; name: string; type: string };
}

function contentListToHtml(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { list: ContentItem[] };
    const items = parsed.list ?? [];
    return items
      .map((item) => {
        if (item.type === 'text' && item.content) return item.content;
        if (item.type === 'image' && item.image) return `<img src="" alt="${item.image.name}" data-s3-key="${item.image.key}" />`;
        return '';
      })
      .join('');
  } catch {
    return '';
  }
}

function htmlToContentList(html: string): PolicyCreateRequestType['content'] {
  // Strip transient src on managed images so we never persist signed URLs
  const cleaned = html.replace(/<img\b([^>]*?)>/g, (full, attrs: string) => {
    if (!/data-s3-key=/.test(attrs)) return full;
    const stripped = attrs.replace(/\ssrc="[^"]*"/g, '');
    return `<img${stripped}>`;
  });
  return { list: [{ type: 'text', content: cleaned }] };
}

async function uploadImageFile(file: File): Promise<{ src: string; key: string }> {
  const result = await getSignedUrlForUploadAction({ key: file.name });
  await axios.put(result.url, file, { headers: { 'Content-Type': file.type } });
  const viewResult = await getSignedUrlForViewAction({ key: result.key });
  return { src: viewResult.url, key: result.key };
}

async function hydrateImageSrcs(html: string): Promise<string> {
  const keys = new Set<string>();
  const re = /data-s3-key="([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) keys.add(match[1]!);
  if (keys.size === 0) return html;
  const entries = await Promise.all(
    Array.from(keys).map(async (key) => [key, (await getSignedUrlForViewAction({ key })).url] as const),
  );
  const urlByKey = new Map(entries);
  return html.replace(/<img\b([^>]*?)>/g, (full, attrs: string) => {
    const keyMatch = /data-s3-key="([^"]+)"/.exec(attrs);
    if (!keyMatch) return full;
    const url = urlByKey.get(keyMatch[1]!);
    if (!url) return full;
    const withoutSrc = attrs.replace(/\ssrc="[^"]*"/g, '');
    return `<img src="${url}"${withoutSrc}>`;
  });
}

interface Props {
  policy?: PolicyDetailResponseType | null;
  backHref: string;
}

export function PolicyEditPage({ policy, backHref }: Props) {
  const router = useRouter();
  const isEditing = !!policy;

  const [title, setTitle] = useState(policy?.title ?? 'Untitled Document');
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(() => {
    if (!policy?.content) return '';
    return contentListToHtml(policy.content);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (!policy?.content) return;
    let cancelled = false;
    void hydrateImageSrcs(contentListToHtml(policy.content)).then((hydrated) => {
      if (!cancelled) setContent(hydrated);
    });
    return () => {
      cancelled = true;
    };
  }, [policy?.content]);

  const handleTitleConfirm = () => {
    if (!title.trim()) setTitle('Untitled Document');
    setEditingTitle(false);
  };

  const handleSave = async () => {
    const finalTitle = title.trim() || 'Untitled Document';
    if (!content.trim() || content === '<p></p>') {
      setError('Content is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data: PolicyCreateRequestType = {
        title: finalTitle,
        content: htmlToContentList(content),
        mediaIds: [],
      };

      if (isEditing && policy) {
        await updatePolicy(policy.id, data);
      } else {
        await createPolicy(data);
      }
      router.push(backHref);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='center-container flex items-center justify-between'>
        <div className='flex items-center gap-3 min-w-0 flex-1'>
          <Link href={backHref}>
            <Button variant='ghost' size='icon' className='shrink-0'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
          </Link>
          {editingTitle ? (
            <div className='flex items-center gap-2 min-w-0 flex-1'>
              <Input
                ref={titleInputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleConfirm();
                  if (e.key === 'Escape') handleTitleConfirm();
                }}
                onBlur={handleTitleConfirm}
                className='text-xl font-medium h-auto py-1'
              />
              <Button variant='ghost' size='icon' className='shrink-0' onClick={handleTitleConfirm}>
                <Check className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-2 min-w-0'>
              <h1 className='text-xl font-medium tracking-tight text-foreground truncate'>{title}</h1>
              <Button variant='ghost' size='icon' className='shrink-0' onClick={() => setEditingTitle(true)}>
                <Pencil className='h-3.5 w-3.5' />
              </Button>
            </div>
          )}
        </div>
        <div className='flex items-center gap-3 shrink-0'>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <Link href={backHref}>
            <Button variant='outline'>Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Policy'}
          </Button>
        </div>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-4 pb-8'>
        <div className='mx-auto w-full max-w-[816px]'>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            onImageUpload={uploadImageFile}
            placeholder='Start writing policy content...'
            stickyToolbar
            className='min-h-[500px] overflow-visible rounded-lg border border-border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus-within:ring-0 [&_.ProseMirror]:px-16 [&_.ProseMirror]:py-8'
          />
        </div>
      </div>
    </div>
  );
}
