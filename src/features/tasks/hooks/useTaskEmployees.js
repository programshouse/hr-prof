import { useQuery } from '@tanstack/react-query';
import { employeesApi } from '@/features/employees/api/employees.api';

export function useTaskEmployees(enabled = true) {
  return useQuery({
    queryKey: ['taskEmployees'],
    queryFn: async () => {
      try {
        const result = await employeesApi.getEmployees();
        console.log('Task Employees API result:', result);
        
        // Handle different response formats
        if (Array.isArray(result)) {
          return result;
        } else if (result && Array.isArray(result.data)) {
          return result.data;
        } else if (result && Array.isArray(result.employees)) {
          return result.employees;
        } else if (result && typeof result === 'object') {
          // Try to find an array property in the response
          const arrayProps = Object.values(result).filter(Array.isArray);
          if (arrayProps.length > 0) {
            console.log('Found array property:', arrayProps[0]);
            return arrayProps[0];
          }
        }
        
        console.log('Could not extract array from result, returning empty array');
        return [];
      } catch (error) {
        console.error('Error in useTaskEmployees:', error);
        throw error;
      }
    },
    enabled,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Failed to load task employees:', error);
    },
  });
}
