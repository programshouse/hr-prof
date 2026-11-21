export const NOTIFICATION_TYPE_ALIASES = {
  leave: 'leave',
  leaves: 'leave',
  holiday: 'holiday',
  holidays: 'holiday',
  loan: 'loan',
  loans: 'loan',
  remotely: 'remotely',
  remote: 'remotely',
  remote_work: 'remotely',
  overtime: 'overtime',
  overtimes: 'overtime',
  over_time: 'overtime',
  branch_transfer: 'branch_transfer',
  branch_transfers: 'branch_transfer',
  'branch-transfer': 'branch_transfer',
  resignation: 'resignation',
  resignations: 'resignation',
  exception: 'exception',
  exceptions: 'exception',
  fingerprint_issue: 'fingerprint_issue',
  fingerprint_issues: 'fingerprint_issue',
  penalty: 'penalty',
  penalties: 'penalty',
  reward: 'reward',
  rewards: 'reward',
  contract: 'contract',
  contracts: 'contract',
  national_id: 'national_id',
  national_ids: 'national_id',
};

export const NOTIFICATION_ROUTES = {
  leave: '/leaves',
  holiday: '/holidays',
  loan: '/loans',
  remotely: '/remotely',
  overtime: '/overtime',
  branch_transfer: '/branch-transfers',
  resignation: '/resignations',
  exception: '/exceptions',
  fingerprint_issue: '/attendance/fingerprint-issues',
  penalty: '/penalties',
  reward: '/rewards',
  contract: '/expiring-contracts',
  national_id: '/expiring-national-ids',
};

// Types whose page highlights one employee row via ?employee=<id>
const EMPLOYEE_ROW_TYPES = new Set(['contract', 'national_id']);

export const NOTIFICATION_ICON_KEYS = {
  leave: 'leave',
  holiday: 'holiday',
  loan: 'loan',
  remotely: 'remotely',
  overtime: 'overtime',
  branch_transfer: 'branch_transfer',
  resignation: 'resignation',
  exception: 'exception',
  fingerprint_issue: 'fingerprint_issue',
  penalty: 'penalty',
  reward: 'reward',
  contract: 'contract',
  national_id: 'national_id',
};

export function resolveNotificationType(notification) {
  const raw =
    notification?.type ??
    notification?.data?.type ??
    notification?.event_key?.split?.('.')?.[0] ??
    '';

  const normalized = String(raw).trim().toLowerCase().replace(/-/g, '_');
  if (NOTIFICATION_TYPE_ALIASES[normalized]) {
    return NOTIFICATION_TYPE_ALIASES[normalized];
  }

  // Expiry notifications may come as e.g. contract_expiring / national_id_expired
  const haystack = `${normalized} ${notification?.event_key ?? ''}`.toLowerCase();
  if (/national[_-]?id/.test(haystack)) return 'national_id';
  if (/contract/.test(haystack)) return 'contract';

  return normalized || null;
}

export function getNotificationRoute(notification) {
  const type = resolveNotificationType(notification);
  const base = type ? NOTIFICATION_ROUTES[type] || null : null;
  if (!base) return null;

  if (EMPLOYEE_ROW_TYPES.has(type)) {
    const data = notification?.data || {};
    const employeeId = data.employee_id ?? data.employeeId ?? data.user_id;
    if (employeeId != null && employeeId !== '') {
      return `${base}?employee=${encodeURIComponent(employeeId)}`;
    }
  }

  return base;
}

export function getNotificationIconKey(notification) {
  const type = resolveNotificationType(notification);
  return type ? NOTIFICATION_ICON_KEYS[type] || 'default' : 'default';
}

export function getNotificationEventAction(notification) {
  const eventKey = notification?.event_key;
  if (!eventKey || !String(eventKey).includes('.')) return 'created';

  return String(eventKey).split('.').slice(1).join('.') || 'created';
}
