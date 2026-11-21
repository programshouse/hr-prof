import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createGeneralHoliday } from '../api/generalHolidays.api';

export function useCreateGeneralHoliday(year) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGeneralHoliday,

    onSuccess: (response) => {
      // update list (or invalidate)
      queryClient.invalidateQueries({
        queryKey: ['general-holidays', year],
      });

      //  show backend message
      toast.success(response?.message || 'Holiday created successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        'Failed to create holiday';

      toast.error(message);
    },
  });
}
