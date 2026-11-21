import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { attendanceKeys } from '../api/attendance.keys';
import { format } from 'date-fns';

export function useAttendanceQuery(
  date,
  page = 1,
  department = '',
  keyword = '',
  branch = '',
  perPage = 10
) {
  const formattedDate = format(date, 'yyyy-MM-dd');

  // Convert 'all' to undefined for API calls
  const normalizedDepartment = department && department !== 'all' ? department : undefined;
  const normalizedBranch = branch && branch !== 'all' ? branch : undefined;
  const normalizedKeyword = keyword || undefined;

  
  return useQuery({
    queryKey: attendanceKeys.list(
      formattedDate,
      page,
      normalizedDepartment,
      normalizedKeyword,
      normalizedBranch,
      perPage
    ),
    queryFn: () =>
      attendanceApi.getDailyReport(
        formattedDate,
        page,
        normalizedDepartment,
        normalizedKeyword,
        normalizedBranch,
        perPage
      ),
    keepPreviousData: true,
  });
}
