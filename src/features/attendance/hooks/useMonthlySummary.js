// src/features/attendance/hooks/useMonthlySummary.js
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import { attendanceKeys } from '../api/attendance.keys';

export const useMonthlySummary = (employeeId, month) => {
  return useQuery({
    queryKey: attendanceKeys.monthlySummary(employeeId, month),
    queryFn: () => attendanceApi.getMonthlySummary(employeeId, month),
    enabled: !!employeeId && !!month,
    select: (data) => data?.data ?? data,
  });
};
