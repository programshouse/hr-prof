import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { attendanceApi } from '../api/attendance.api';

export function useDailySummaryCards({ fromDate, toDate, branch, keyword } = {}) {
  const from = fromDate ? format(fromDate, 'yyyy-MM-dd') : undefined;
  const to = toDate ? format(toDate, 'yyyy-MM-dd') : undefined;

  return useQuery({
    queryKey: ['attendanceDailySummaryCards', { from, to, branch, keyword }],
    queryFn: () =>
      attendanceApi.getDailySummaryCards({
        from,
        to,
        branch: branch && branch !== 'all' ? branch : undefined,
        keyword: keyword || undefined,
      }),
    enabled: !!from || !!to,
  });
}
