/**
 * Parse a YYYY-MM-DD string, Date instance, or parseable date string into a local Date.
 * Validates YYYY-MM-DD calendar bounds (e.g. rejects invalid dates like 2026-11-31).
 *
 * @param {Date | string | null | undefined} value
 * @returns {Date | undefined}
 */
export function parseFilterDate(value) {
  if (!value) return undefined;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    const parsed = new Date(year, month - 1, day);

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return undefined;
    }

    return parsed;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

/**
 * Format a Date or date string as YYYY-MM-DD in local calendar time.
 *
 * @param {Date | string | null | undefined} value
 * @returns {string}
 */
export function formatFilterDate(value) {
  const parsed = parseFilterDate(value);
  if (!parsed) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Compute inclusive YYYY-MM-DD start and end dates for the month of the given Date.
 *
 * @param {Date} date
 * @returns {{ from: string, to: string }}
 */
export function getMonthDateRange(date) {
  const year = date.getFullYear();
  const monthNumber = date.getMonth() + 1;
  const month = String(monthNumber).padStart(2, '0');
  const lastDay = new Date(year, monthNumber, 0).getDate();

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Read initial sheet filter state from URL search params with normalized YYYY-MM-DD dates.
 *
 * @param {URLSearchParams} searchParams
 * @param {Record<string, any>} defaults
 * @returns {Record<string, any>}
 */
export function getInitialSheetFilters(searchParams, defaults) {
  return {
    ...defaults,
    search: searchParams.get('search') || defaults.search,
    branch: searchParams.get('branch') || defaults.branch,
    department: searchParams.get('department') || defaults.department,
    position: searchParams.get('position') || defaults.position,
    shift: searchParams.get('shift') || defaults.shift,
    from: formatFilterDate(searchParams.get('from')) || defaults.from,
    to: formatFilterDate(searchParams.get('to')) || defaults.to,
  };
}
