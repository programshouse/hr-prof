// src/features/holidays/hooks/useDeleteEmployeeOfficialHoliday.js

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { holidaysApi } from '../api/holidays.api';
import { toast } from 'sonner';

export function useDeleteEmployeeOfficialHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => holidaysApi.deleteEmployeeOfficialHoliday(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['total-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      queryClient.invalidateQueries({ queryKey: ['official-holidays'] });

      toast.success(
        data?.message || 'Holiday deleted successfully'
      );
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Failed to delete holiday'
      );
    },
  });
}