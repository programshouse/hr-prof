import { notificationsApi } from '../api/notifications.api';
import {
  mergeNotificationPages,
  normalizeNotificationsResponse,
} from '../utils/notificationUtils';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGES = 50;

export async function fetchAllNotifications(params = {}) {
  const requestedPageSize = params.per_page ?? params.limit ?? DEFAULT_PAGE_SIZE;
  let page = params.page ?? 1;

  const pages = [];
  let lastMeta = {};

  for (let i = 0; i < MAX_PAGES; i += 1) {
    const response = await notificationsApi.getNotifications({
      ...params,
      audience: params.audience ?? 'system',
      page,
      per_page: requestedPageSize,
    });

    const { rows, meta } = normalizeNotificationsResponse(response);
    lastMeta = meta;

    if (!rows.length) break;

    pages.push(rows);

    const mergedCount = mergeNotificationPages(pages).length;
    const total = meta.total ?? mergedCount;
    const effectivePageSize = meta.per_page ?? rows.length;

    if (mergedCount >= total) break;
    if (rows.length < effectivePageSize) break;
    if (meta.last_page && page >= meta.last_page) break;

    page += 1;
  }

  const rows = mergeNotificationPages(pages);

  return {
    rows,
    meta: {
      ...lastMeta,
      current_page: lastMeta.current_page ?? 1,
      last_page: lastMeta.last_page ?? 1,
      total: lastMeta.total ?? rows.length,
      per_page: lastMeta.per_page ?? requestedPageSize,
    },
  };
}