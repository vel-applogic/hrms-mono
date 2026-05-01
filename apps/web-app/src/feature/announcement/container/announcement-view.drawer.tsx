'use client';

import type { AnnouncementDetailResponseType } from '@repo/dto';
import { Badge } from '@repo/ui/component/ui/badge';
import { MarkdownViewer } from '@repo/ui/component/markdown-viewer';
import { Drawer } from '@repo/ui/container/drawer/drawer';
import { useCallback, useEffect, useState } from 'react';

import { getAnnouncementById } from '@/lib/action/announcement.actions';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcementId: number | null;
}

export function AnnouncementViewDrawer({ open, onOpenChange, announcementId }: Props) {
  const [detail, setDetail] = useState<AnnouncementDetailResponseType | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDetail = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await getAnnouncementById(id);
      setDetail(data);
    } catch {
      // handled by service
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && announcementId) {
      loadDetail(announcementId);
    } else {
      setDetail(null);
    }
  }, [open, announcementId, loadDetail]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} title='Announcement'>
      {loading && <div className='p-6 text-sm text-muted-foreground'>Loading...</div>}
      {!loading && detail && (
        <div className='flex flex-col gap-4 p-6'>
          <div className='flex flex-wrap items-center justify-end gap-2 text-sm text-muted-foreground'>
            <span>Scheduled: {new Date(detail.scheduledAt).toLocaleString()}</span>
            {detail.isPublished ? <Badge variant='default'>Published</Badge> : <Badge variant='outline'>Draft</Badge>}
          </div>
          <div className='rounded-lg border border-border bg-white px-10 py-10 shadow-[0_2px_12px_rgba(0,0,0,0.08)]'>
            <h1 className='mb-6 text-center text-2xl font-bold text-foreground'>{detail.title}</h1>
            <div className='prose prose-sm max-w-none'>
              <MarkdownViewer value={detail.message} />
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
