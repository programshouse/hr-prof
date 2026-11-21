import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/services/auth/auth.store';
import { hasItemPermission, toBooleanFlag } from '@/lib/permissions';
import NotificationIcon from './NotificationIcon';
import { useNotificationsQuery } from '../hooks/useNotificationsQuery';
import { useMarkNotificationRead } from '../hooks/useNotificationMutations';
import {
  formatNotificationTime,
  getNotificationBody,
  getNotificationMeta,
  getNotificationRoute,
  getNotificationTitle,
  isNotificationUnread,
} from '../utils/notificationUtils';

function NotificationItem({ notification, onSelect, isPending }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const unread = isNotificationUnread(notification);
  const title = getNotificationTitle(notification, t);
  const body = getNotificationBody(notification, t);
  const meta = getNotificationMeta(notification, t);
  const timeLabel = formatNotificationTime(notification.created_at, i18n.language);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => onSelect(notification)}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        'flex w-full gap-3 border-b border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50',
        unread && 'bg-blue-50/60 hover:bg-blue-50',
        isPending && 'opacity-60',
        isRTL ? 'text-right' : 'text-left'
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
        <NotificationIcon notification={notification} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-slate-900">{title}</p>

          {unread ? (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          ) : null}
        </div>

        {body ? <p className="mt-0.5 text-xs text-slate-600">{body}</p> : null}

        {meta ? <p className="mt-1 text-xs text-slate-500">{meta}</p> : null}

        {timeLabel ? <p className="mt-1 text-[11px] text-slate-400">{timeLabel}</p> : null}
      </div>
    </button>
  );
}

export default function NotificationBell() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const { user, permissions, role } = useAuthStore();
  const isSuperAdmin = toBooleanFlag(user?.is_super_admin);
  const isEmployeeRole = role === 'employee';
  const canViewNotifications =
    isEmployeeRole ||
    isSuperAdmin ||
    hasItemPermission(
      ['notifications.*', 'notifications.index'],
      permissions,
      isSuperAdmin
    );

  const isRTL = i18n.language === 'ar';

  const { data, isLoading, isFetching, refetch } = useNotificationsQuery(
    {
      page: 1,
      per_page: 20,
      audience: 'system',
    },
    { enabled: canViewNotifications }
  );

  const { mutateAsync: markAsRead } = useMarkNotificationRead();

  if (!canViewNotifications) {
    return null;
  }

  const notifications = data?.rows || [];
  const unreadCount = data?.unreadCount || 0;
  const totalCount = data?.meta?.total ?? notifications.length;

  const handleSelect = async (notification) => {
    setPendingId(notification.id);

    try {
      if (isNotificationUnread(notification)) {
        await markAsRead(notification.id);
      }

      const route = getNotificationRoute(notification);

      if (route) {
        setOpen(false);
        navigate(route);
      }
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) refetch();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="input"
          size="icon"
          className="relative size-8 rounded-full border-2 border-gray-200"
          aria-label={t('notifications.title', 'Notifications')}
        >
          <Bell className="text-primary size-5" />

          {unreadCount > 0 ? (
            <span
              className={cn(
                'absolute -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white',
                isRTL ? '-left-1' : '-right-1'
              )}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        dir={isRTL ? 'rtl' : 'ltr'}
        align={isRTL ? 'start' : 'end'}
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <div
          className={cn(
            'flex items-center justify-between border-b border-slate-200 px-4 py-3',
            isRTL ? 'text-right' : 'text-left'
          )}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {t('notifications.title', 'Notifications')}
            </p>

            <p className="text-xs text-slate-500">
              {t('notifications.totalCount', {
                count: totalCount,
                defaultValue: '{{count}} total',
              })}

              {unreadCount > 0
                ? ` · ${t('notifications.unreadCount', {
                    count: unreadCount,
                    defaultValue: '{{count}} unread',
                  })}`
                : ''}
            </p>
          </div>

          {isFetching && !isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : null}
        </div>
        <div className="overflow-y-auto overscroll-contain max-h-[450px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              {t('notifications.empty', 'No notifications')}
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onSelect={handleSelect}
                isPending={pendingId === notification.id}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
