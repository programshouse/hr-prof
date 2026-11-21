// src/features/overtime/hooks/useOvertimeSheetQuery.js
import { useQuery } from '@tanstack/react-query';
import { overtimeApi } from '../api/overtime.api';

export function useOvertimeSheetQuery(params) {
  return useQuery({
    queryKey: ['overtime-minutes-summary', params],
    queryFn: () => overtimeApi.getOvertimeMinutesSummary(params),
    keepPreviousData: true,
  });
}