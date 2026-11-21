import { useQuery } from '@tanstack/react-query';
import { holidaysApi } from '../api/holidays.api';
import { holidaysKeys } from '../api/holidays.keys';

export function useHolidaySummaryQuery() {
  return useQuery({
    queryKey: holidaysKeys.summary(),
    queryFn: async () => {
      const response = await holidaysApi.getHolidaySummary();

      // Response: { employees_on_holiday, approved_holidays, rejected_holidays, pending_holidays }
      const data = response?.data || response || {}; // Handle both wrapped and unwrapped

      return {
        employeesOnHoliday: data.employees_on_holiday || 0,
        approvedHolidays: data.approved_holidays || 0,
        rejectedHolidays: data.rejected_holidays || 0,
        pendingHolidays: data.pending_holidays || 0,
      };
    },
  });
}
