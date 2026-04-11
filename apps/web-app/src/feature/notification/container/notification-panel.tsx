'use client';

import type { NotificationResponseType } from '@repo/dto';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui/component/ui/popover';
import { cn } from '@repo/ui/lib/utils';
import { notificationLinkDtoEnumToRoute } from '@repo/shared';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getNotificationUnseenCount, markAllNotificationsSeen, markNotificationSeen, searchNotifications } from '@/lib/action/notification.actions';

const POLL_INTERVAL = 30000;
const PAGE_SIZE = 20;

export function NotificationPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponseType[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchUnseenCount = useCallback(async () => {
    try {
      const result = await getNotificationUnseenCount();
      setUnseenCount(result.count);
    } catch {
      // silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchNotifications({
        pagination: { page: 1, limit: PAGE_SIZE },
      });
      setNotifications(result.results);
      setTotalRecords(result.totalRecords);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUnseenCount();
    const interval = setInterval(() => {
      void fetchUnseenCount();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnseenCount]);

  useEffect(() => {
    if (open) {
      void fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkSeen = async (notification: NotificationResponseType) => {
    if (!notification.isSeen) {
      await markNotificationSeen(notification.id);
      setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isSeen: true } : n)));
      setUnseenCount((prev) => Math.max(0, prev - 1));
    }
    const route = notificationLinkDtoEnumToRoute(notification.link);
    setOpen(false);
    router.push(route);
  };

  const handleMarkAllSeen = async () => {
    await markAllNotificationsSeen();
    setNotifications((prev) => prev.map((n) => ({ ...n, isSeen: true })));
    setUnseenCount(0);
  };

  const formatTimeAgo = (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className='relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'>
          <Bell className='h-5 w-5' />
          {unseenCount > 0 && (
            <span className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground'>
              {unseenCount > 99 ? '99+' : unseenCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-80 p-0 sm:w-96'>
        <div className='flex items-center justify-between border-b px-4 py-3'>
          <h3 className='text-sm font-semibold'>Notifications</h3>
          {unseenCount > 0 && (
            <button onClick={handleMarkAllSeen} className='flex items-center gap-1 text-xs text-primary hover:underline'>
              <CheckCheck className='h-3.5 w-3.5' />
              Mark all as read
            </button>
          )}
        </div>
        <div className='max-h-80 overflow-y-auto'>
          {loading && notifications.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : notifications.length === 0 ? (
            <div className='py-8 text-center text-sm text-muted-foreground'>No notifications</div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleMarkSeen(notification)}
                className={cn(
                  'flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-accent',
                  !notification.isSeen && 'bg-primary/5',
                )}
              >
                <div className='flex items-start justify-between gap-2'>
                  <span className={cn('text-sm', !notification.isSeen ? 'font-semibold' : 'font-medium')}>{notification.title}</span>
                  {!notification.isSeen && <span className='mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary' />}
                </div>
                <p className='text-xs text-muted-foreground line-clamp-2'>{notification.message}</p>
                <span className='mt-0.5 text-[10px] text-muted-foreground'>{formatTimeAgo(notification.createdAt)}</span>
              </button>
            ))
          )}
        </div>
        {totalRecords > PAGE_SIZE && (
          <div className='border-t px-4 py-2 text-center'>
            <span className='text-xs text-muted-foreground'>Showing {PAGE_SIZE} of {totalRecords} notifications</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
