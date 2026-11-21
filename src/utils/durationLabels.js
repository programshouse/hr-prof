const UNIT_KEYS = {
  day: { one: 'common.day', other: 'common.days' },
  month: { one: 'common.month', other: 'common.months' },
  year: { one: 'common.year', other: 'common.years' },
  hour: { one: 'common.hour', other: 'common.hours' },
  minute: { one: 'common.minute', other: 'common.minutes' },
  task: { one: 'common.task', other: 'common.tasks' },
};

export function getUnitLabel(t, unit, count = 2) {
  const n = Number(count);
  const isOne = n === 1;
  const keys = UNIT_KEYS[unit] || UNIT_KEYS.day;

  return t(isOne ? keys.one : keys.other);
}

/** e.g. "3 months", "1 day" */
export function formatCountWithUnit(t, count, unit) {
  const n = Number(count) || 0;
  return `${n} ${getUnitLabel(t, unit, n)}`;
}

/** Contract duration from total months: "2 years, 3 months" */
export function formatMonthsDuration(t, totalMonths) {
  if (totalMonths === null || totalMonths === undefined) return '—';

  const months = Number(totalMonths);
  if (Number.isNaN(months)) return '—';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const parts = [];

  if (years > 0) {
    parts.push(formatCountWithUnit(t, years, 'year'));
  }

  if (remainingMonths > 0) {
    parts.push(formatCountWithUnit(t, remainingMonths, 'month'));
  }

  return parts.length > 0 ? parts.join(', ') : formatCountWithUnit(t, 0, 'month');
}

/** e.g. "5h 30m" with translated unit suffixes */
export function formatHoursMinutesShort(t, totalMinutes) {
  const minutes = Number(totalMinutes) || 0;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const h = t('common.hourShort');
  const m = t('common.minuteShort');

  return `${hours}${h} ${mins}${m}`;
}

/** Value + unit suffix for tables (e.g. 5 + "days") */
export function formatValueWithUnitSuffix(t, value, unit) {
  return `${value ?? 0} ${getUnitLabel(t, unit, value)}`;
}

/** Compact minutes: "2h 15m" using short unit labels */
export function formatMinutesDurationShort(t, totalMinutes) {
  const total = Math.round(Number(totalMinutes) || 0);
  if (total <= 0) {
    return `${0}${t('common.hourShort')} ${0}${t('common.minuteShort')}`;
  }
  if (total < 60) {
    return `${total}${t('common.minuteShort')}`;
  }

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (mins === 0) return `${hours}${t('common.hourShort')}`;
  return `${hours}${t('common.hourShort')} ${mins}${t('common.minuteShort')}`;
}

/** Long minutes: "2 hours 15 minutes" with correct pluralization */
export function formatMinutesDurationLong(t, totalMinutes) {
  const total = Math.round(Number(totalMinutes) || 0);
  if (total === 0) return formatCountWithUnit(t, 0, 'minute');

  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours > 0 && mins <= 0) return formatCountWithUnit(t, hours, 'hour');
  if (hours > 0 && mins > 0) {
    return `${formatCountWithUnit(t, hours, 'hour')} ${formatCountWithUnit(t, mins, 'minute')}`;
  }

  return formatCountWithUnit(t, mins, 'minute');
}
