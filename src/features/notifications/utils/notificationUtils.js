import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import {
  getNotificationEventAction,
  resolveNotificationType,
} from './notificationConfig';

export {
  getNotificationRoute,
  resolveNotificationType,
  getNotificationIconKey,
} from './notificationConfig';

export function isNotificationUnread(notification) {
  return !notification?.read_at;
}

function translateNotificationField(notification, t, field) {
  const eventKey = notification?.event_key;

  if (eventKey) {
    const eventKeyPath = `notifications.events.${eventKey}.${field}`;
    const eventTranslation = t(eventKeyPath, { defaultValue: '' });
    if (eventTranslation && eventTranslation !== eventKeyPath) {
      return eventTranslation;
    }
  }

  const type = resolveNotificationType(notification);
  const action = getNotificationEventAction(notification);

  if (type) {
    const typeLabel = t(`notifications.types.${type}`, {
      defaultValue: type,
    });
    const actionPath = `notifications.actions.${action}.${field}`;
    const actionTranslation = t(actionPath, {
      type: typeLabel,
      defaultValue: '',
    });

    if (actionTranslation && actionTranslation !== actionPath) {
      return actionTranslation;
    }
  }

  return notification?.[field] || '';
}

export function getNotificationTitle(notification, t) {
  const translated = translateNotificationField(notification, t, 'title');
  if (translated) return translated;

  return notification?.title || t('notifications.unknownTitle', 'Notification');
}

export function getNotificationBody(notification, t) {
  const translated = translateNotificationField(notification, t, 'body');
  if (translated) return translated;

  return notification?.body || '';
}
export function getNotificationMeta(notification, t) {
  const payload = notification?.data || {};
  const parts = [];

  const employeeName = payload.employee_name;
  const employeeId = payload.employee_id;

  if (employeeName) {
    parts.push(employeeName);
  } else if (employeeId) {
    parts.push(
      t('notifications.employeeId', {
        id: employeeId,
        defaultValue: `Employee #${employeeId}`,
      })
    );
  }

  if (payload.date) {
    if (payload.from && payload.to) {
      parts.push(`${payload.date} (${payload.from} - ${payload.to})`);
    } else {
      parts.push(payload.date);
    }
  } else if (payload.from && payload.to) {
    parts.push(
      payload.from === payload.to
        ? payload.from
        : `${payload.from} → ${payload.to}`
    );
  }

  const status = payload.status;
  if (status) {
    parts.push(
      t(`requests.status.${String(status).toLowerCase()}`, { defaultValue: status })
    );
  }

  return parts.filter(Boolean).join(' · ');
}

export function formatNotificationTime(value, language = 'en') {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const locale = String(language).startsWith('ar') ? ar : enUS;

  return formatDistanceToNow(date, { addSuffix: true, locale });
}

export function countUnreadNotifications(notifications = []) {
  return notifications.filter(isNotificationUnread).length;
}

/**
 * Supports Laravel paginated and flat array API shapes:
 * - { status, data: { data: [...], total, last_page, ... } }
 * - { status, data: [...] }
 * - { data: [...], meta: {...} }
 * - { current_page, data: [...], total, ... }
 */
export function normalizeNotificationsResponse(payload) {
  if (!payload) {
    return emptyNotificationsResult();
  }

  // { status: true, data: { data: [...], total, ... } }
  if (payload?.status === true && payload?.data != null) {
    return normalizeNotificationsResponse(payload.data);
  }

  // { data: [...], meta: {...} }
  if (Array.isArray(payload?.data) && payload?.meta) {
    return {
      rows: payload.data,
      meta: {
        current_page: payload.meta.current_page ?? 1,
        last_page: payload.meta.last_page ?? 1,
        per_page: payload.meta.per_page ?? payload.data.length,
        total: payload.meta.total ?? payload.data.length,
      },
    };
  }

  if (Array.isArray(payload)) {
    return {
      rows: payload,
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: payload.length,
        total: payload.length,
      },
    };
  }

  if (payload && typeof payload === 'object') {
    if (Array.isArray(payload.data)) {
      return {
        rows: payload.data,
        meta: {
          current_page: payload.current_page ?? 1,
          last_page: payload.last_page ?? 1,
          per_page: payload.per_page ?? payload.data.length,
          total: payload.total ?? payload.data.length,
        },
      };
    }

    if (Array.isArray(payload.rows)) {
      return {
        rows: payload.rows,
        meta: {
          current_page: payload.current_page ?? 1,
          last_page: payload.last_page ?? 1,
          per_page: payload.per_page ?? payload.rows.length,
          total: payload.total ?? payload.rows.length,
        },
      };
    }

    const values = Object.values(payload).filter(
      (item) =>
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        item.id != null &&
        (item.event_key != null || item.title != null || item.type != null)
    );

    if (values.length > 0) {
      return {
        rows: values,
        meta: {
          current_page: payload.current_page ?? 1,
          last_page: payload.last_page ?? 1,
          per_page: payload.per_page ?? values.length,
          total: payload.total ?? values.length,
        },
      };
    }
  }

  return emptyNotificationsResult();
}

function emptyNotificationsResult() {
  return {
    rows: [],
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 0,
      total: 0,
    },
  };
}

export function mergeNotificationPages(pages = []) {
  const seen = new Set();
  const merged = [];

  for (const pageRows of pages) {
    for (const row of pageRows) {
      if (!row?.id || seen.has(row.id)) continue;
      seen.add(row.id);
      merged.push(row);
    }
  }

  return merged;
}
