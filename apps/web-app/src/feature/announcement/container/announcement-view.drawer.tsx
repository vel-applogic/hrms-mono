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
        <div className='flex flex-col gap-5 p-6'>
          <div className='rounded-lg border border-border p-4'>
            <h3 className='mb-3 text-lg font-semibold'>{detail.title}</h3>
            <div className='mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
              <span>Scheduled: {new Date(detail.scheduledAt).toLocaleString()}</span>
              {detail.branch && <Badge variant='secondary'>{detail.branch.name}</Badge>}
              {detail.department && <Badge variant='secondary'>{detail.department.name}</Badge>}
              {detail.isPublished ? <Badge variant='default'>Published</Badge> : <Badge variant='outline'>Draft</Badge>}
              {detail.isNotificationSent && <Badge variant='secondary'>Notified</Badge>}
            </div>
            <div className='prose prose-sm max-w-none'>
              <MarkdownViewer value={detail.message} />
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
