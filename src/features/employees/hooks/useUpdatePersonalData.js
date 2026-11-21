// src/features/employees/hooks/useUpdatePersonalData.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';

export function useUpdatePersonalData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => employeesApi.updatePersonalData({ id, values }),

    onSuccess: (_data, variables) => {
      // refresh anything that depends on employee list/details
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(variables.id) });

      toast.success('Employee updated successfully');
    },

    onError: (error) => {
      const message = error?.response?.data?.message || 'Failed to update employee';
      toast.error(message);
    },
  });
}
