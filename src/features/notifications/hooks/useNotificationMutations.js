import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { notificationsApi } from '../api/notifications.api';
import { notificationKeys } from '../api/notifications.keys';

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        t('notifications.markReadError', 'Failed to mark notification as read');
      toast.error(message);
    },
  });
}
