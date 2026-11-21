import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { deleteGeneralHoliday } from '../api/generalHolidays.api';

export function useDeleteGeneralHoliday(year) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGeneralHoliday,

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['general-holidays', year],
      });

      toast.success(response?.message || 'Holiday deleted successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        'Failed to delete holiday';

      toast.error(message);
    },
  });
}
