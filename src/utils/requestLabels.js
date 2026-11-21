export function normalizeRequestKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

const HOLIDAY_TYPE_KEY_PREFIX = 'messages.holiday_types.';

const KNOWN_TYPE_KEYS = {
  annual: 'holidays.types.annual',
  'annual leave': 'holidays.types.annual',
  annual_leave: 'holidays.types.annual',
  sick: 'holidays.types.sick',
  'sick leave': 'holidays.types.sick',
  sick_leave: 'holidays.types.sick',
  casual: 'holidays.types.casual',
  'casual leave': 'holidays.types.casual',
  casual_leave: 'holidays.types.casual',
  holiday: 'holidays.types.holiday',
  weekend: 'holidays.types.weekend',
  weekends: 'holidays.types.weekend',
  official: 'holidays.types.official',
  'official holiday': 'holidays.types.officialHoliday',
  official_holiday: 'holidays.types.officialHoliday',
  'official holiday allowance': 'holidays.types.officialHolidayAllowance',
  official_holiday_allowance: 'holidays.types.officialHolidayAllowance',
};

function unwrapHolidayTypeKey(type) {
  const raw = String(type ?? '').trim();
  if (!raw) return '';

  if (raw.toLowerCase().startsWith(HOLIDAY_TYPE_KEY_PREFIX)) {
    return raw.slice(HOLIDAY_TYPE_KEY_PREFIX.length).trim();
  }

  return raw;
}

function tryTranslateKey(t, key) {
  if (!key) return null;

  const translated = t(key);
  if (translated && translated !== key) return translated;

  return null;
}

function buildTypeTranslationKeys(unwrapped) {
  const normalized = normalizeRequestKey(unwrapped);
  const keys = [];

  keys.push(`salaries.messages.holiday_types.${unwrapped}`);
  keys.push(`messages.holiday_types.${unwrapped}`);

  if (normalized !== unwrapped) {
    keys.push(`salaries.messages.holiday_types.${normalized}`);
    keys.push(`messages.holiday_types.${normalized}`);
  }

  if (normalized) {
    keys.push(
      `salaries.messages.holiday_types.${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    );
    keys.push(
      `messages.holiday_types.${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    );
  }

  keys.push(`holidays.types.${normalized}`);
  keys.push(`leaves.types.${normalized}`);

  return [...new Set(keys)];
}

function resolveRequestTypeLabel(t, type) {
  const unwrapped = unwrapHolidayTypeKey(type);
  if (!unwrapped) return '—';

  const normalized = normalizeRequestKey(unwrapped);
  const knownKey = KNOWN_TYPE_KEYS[normalized] || KNOWN_TYPE_KEYS[unwrapped.toLowerCase()];

  if (knownKey) {
    const knownTranslation = tryTranslateKey(t, knownKey);
    if (knownTranslation) return knownTranslation;
  }

  for (const key of buildTypeTranslationKeys(unwrapped)) {
    const translated = tryTranslateKey(t, key);
    if (translated) return translated;
  }

  return unwrapped;
}

export function translateRequestStatus(t, status) {
  const key = normalizeRequestKey(status);
  if (!key) return '—';

  return t(`requests.status.${key}`, {
    defaultValue: status || '—',
  });
}

export function translateLeaveType(t, type) {
  return resolveRequestTypeLabel(t, type);
}

export function translateHolidayType(t, type) {
  return resolveRequestTypeLabel(t, type);
}

export function formatRequestTime(timeStr, language = 'en') {
  if (!timeStr) return '—';

  const [hours, minutes] = String(timeStr).split(':');
  const h = parseInt(hours, 10);

  if (Number.isNaN(h)) return '—';

  const isAr = String(language).startsWith('ar');
  const suffix = h >= 12 ? (isAr ? 'م' : 'pm') : (isAr ? 'ص' : 'am');
  const h12 = h % 12 || 12;

  return `${h12}:${minutes || '00'} ${suffix}`;
}

export function formatRequestTimeRange(from, to, language = 'en') {
  const fromLabel = formatRequestTime(from, language);
  const toLabel = formatRequestTime(to, language);

  if (fromLabel === '—' && toLabel === '—') return '—';

  return `${fromLabel} - ${toLabel}`;
}

export function getRequestStatusColorClass(status) {
  const key = normalizeRequestKey(status);

  const statusColors = {
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-700',
    waiting: 'bg-gray-100 text-gray-700',
  };

  return statusColors[key] || 'bg-gray-100 text-gray-700';
}
