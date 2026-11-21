import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateGeneralHoliday } from '../api/generalHolidays.api';

export function useUpdateGeneralHoliday(year) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }) => updateGeneralHoliday(id, payload),

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['general-holidays', year],
      });

      toast.success(response?.message || 'Holiday updated successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        'Failed to update holiday';

      toast.error(message);
    },
  });
}
