import { useMutation, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees.api';
import { employeeKeys } from '../api/employees.keys';
import { toast } from 'sonner';

export function useUpsertEmployee() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    // IMPORTANT: pass values to API
    mutationFn: (values) => employeesApi.createEmployee(values),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Employee created successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || 'Failed to create employee';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    // IMPORTANT: params = { id, values }
    mutationFn: (params) => employeesApi.updateEmployee(params),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.id),
      });

      toast.success('Employee updated successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || 'Failed to update employee';
      toast.error(message);
    },
  });

  return {
    create: createMutation,
    update: updateMutation,
  };
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeesApi.deleteEmployee,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      toast.success('Employee deleted successfully');
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || 'Failed to delete employee';
      toast.error(message);
    },
  });
}
