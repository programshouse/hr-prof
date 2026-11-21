import { useMutation, useQueryClient } from '@tanstack/react-query';
import { holidaysApi } from '../api/holidays.api';
import { holidaysKeys } from '../api/holidays.keys';
import { toast } from 'sonner';

export function useUpsertHoliday() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (formData) => holidaysApi.createHoliday(formData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holidaysKeys.all });
      toast.success('Holiday request created successfully');
    },

    onError: (error) => {
      // keep single toast here
      toast.error(error?.response?.data?.message || 'Failed to create holiday request');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, values }) => {
      // values MUST be FormData for file uploads
      if (values instanceof FormData && !values.has('_method')) {
        values.append('_method', 'PATCH');
      }
      return holidaysApi.updateHoliday({ id, values });
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: holidaysKeys.all });
      queryClient.invalidateQueries({ queryKey: holidaysKeys.detail(variables.id) });
      toast.success('Holiday request updated successfully');
    },

    onError: (error) => {
      // keep single toast here
      toast.error(error?.response?.data?.message || 'Failed to update holiday request');
    },
  });

  return { create, update };
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => holidaysApi.deleteHoliday(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: holidaysKeys.all });
      queryClient.invalidateQueries({ queryKey: holidaysKeys.detail(id) });
      toast.success('Holiday request deleted successfully');
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to delete holiday request');
    },
  });
}
