import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';
import { dashboardKeys } from '../api/dashboard.keys';

/**
 * useDashboardHeader - Fetches dashboard header statistics.
 *
 * @returns {object} React Query result with dashboard statistics:
 *   - total_employees: Total number of employees
 *   - full_time_count: Number of full-time employees
 *   - part_time_count: Number of part-time employees
 *   - freelance_count: Number of freelance employees
 */
export function useDashboardHeader(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: dashboardKeys.homeHeader(),
    queryFn: dashboardApi.getHomeHeader,
    enabled,
  });
}
