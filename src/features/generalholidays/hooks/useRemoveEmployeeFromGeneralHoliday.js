import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { removeEmployeeFromGeneralHoliday } from '../api/generalHolidays.api';

export function useRemoveEmployeeFromGeneralHoliday(year) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ holiday_id, employee_id }) =>
      removeEmployeeFromGeneralHoliday(holiday_id, employee_id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['general-holidays', year] });
      queryClient.invalidateQueries({ queryKey: ['total-holidays'] });
      toast.success(data?.message || 'Employee removed from holiday');
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to remove employee from holiday');
    },
  });
}
