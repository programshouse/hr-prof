import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from '../api/dashboard.keys';

/**
 * useGraph - Fetches attendance graph data.
 *
 * @returns {object} React Query result with graph data containing attendance statistics
 */
export function useGraph() {
  return useQuery({
    queryKey: dashboardKeys.graph(),
    queryFn: dashboardApi.getGraph,
  });
}

export function useDeptCounts() {
  return useQuery({
    queryKey: dashboardKeys.deptCounts(),
    queryFn: dashboardApi.getDeptCounts,
  });
}

export function useEmployeeTrend(year) {
  return useQuery({
    queryKey: dashboardKeys.employeeTrend(year),
    queryFn: () => dashboardApi.getEmployeeTrend(year),
    enabled: !!year,
  });
}
