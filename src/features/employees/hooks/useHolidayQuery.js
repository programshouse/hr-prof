import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';

export function useHolidayQuery(employeeId) {
  return useQuery({
    queryKey: ['contract', employeeId],
    queryFn: () => employeesApi.getContractBalance(employeeId),
    enabled: !!employeeId, // Only run query if employeeId exists
    select: (response) => {
      // Handle the new API response structure
      const data = response?.data || response;
      
      // Calculate used days from the used array if it contains objects
      let usedDays = 0;
      if (Array.isArray(data.used)) {
        usedDays = data.used.reduce((total, item) => {
          if (typeof item === 'object' && item.days) {
            return total + item.days;
          }
          return total;
        }, 0);
      } else if (typeof data.used === 'number') {
        usedDays = data.used;
      }
      
      return {
        employeeId: data.employee_id || employeeId,
        eligible: data.eligible || false,
        from: data.from || null,
        to: data.to || null,
        used: usedDays,
        remaining: data.remaining || 0,
        reason: data.reason || null,
        // For backward compatibility
        total: (usedDays + (data.remaining || 0))
      };
    },
  });
}
