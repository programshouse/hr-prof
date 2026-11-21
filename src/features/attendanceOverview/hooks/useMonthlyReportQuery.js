// src/features/attendanceOverview/hooks/useMonthlyReportQuery.js
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isValid } from 'date-fns';
import { attendanceApi } from '../../attendance/api/attendance.api';

function toDateSafe(value) {
  if (!value) return undefined;

  // If it's already a Date
  if (value instanceof Date) {
    return isValid(value) ? value : undefined;
  }

  // If it's a string like "2025-12-01"
  if (typeof value === 'string') {
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }

  return undefined;
}

export function useMonthlyReportQuery({
  fromDate,
  toDate,
  company,
  branch,
  keyword,
  name_code_phone,
  page = 1,
  perPage = 10,
}) {
  const fromD = toDateSafe(fromDate);
  const toD = toDateSafe(toDate);

  // ✅ month should come from the selected range, not always "today"
  const monthBase = fromD || toD || new Date();
  const month = format(monthBase, 'yyyy-MM');

  const from = fromD ? format(fromD, 'yyyy-MM-dd') : undefined;
  const to = toD ? format(toD, 'yyyy-MM-dd') : undefined;

  const normalizedBranch = branch && branch !== 'all' ? branch : undefined;
  const normalizedCompany = company && company !== 'all' ? company : undefined;
  const normalizedKeyword = keyword || undefined;

  return useQuery({
    queryKey: [
      'attendanceMonthlyReport',
      {
        month,
        from,
        to,
        company: normalizedCompany,
        branch: normalizedBranch,
        keyword: normalizedKeyword,
        name_code_phone: name_code_phone || undefined,
        page,
        perPage,
      },
    ],
    queryFn: () =>
      attendanceApi.getMonthlyReport(
        month,
        from,
        to,
        normalizedCompany,
        normalizedBranch,
        normalizedKeyword,
        name_code_phone,
        page,
        perPage
      ),
    enabled: Boolean(month),
    // ✅ TanStack Query v5 way to keep previous data during pagination
    placeholderData: (prev) => prev,
  });
}
