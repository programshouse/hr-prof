import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeTasksApi } from '../api/employeeTasksApi';

// Hook for fetching employee tasks
export function useEmployeeTasks(filters = {}) {
  return useQuery({
    queryKey: ['employeeTasks', filters],
    queryFn: () => employeeTasksApi.getEmployeeTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for creating employee task
export function useCreateEmployeeTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeTasksApi.createEmployeeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeTasks'] });
    },
    onError: (error) => {
      console.error('Error creating employee task:', error);
    },
  });
}

// Hook for updating employee task
export function useUpdateEmployeeTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }) => employeeTasksApi.updateEmployeeTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeTasks'] });
    },
    onError: (error) => {
      console.error('Error updating employee task:', error);
      throw error; // Re-throw error so caller can handle it
    },
  });
}

// Hook for deleting employee task
export function useDeleteEmployeeTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: employeeTasksApi.deleteEmployeeTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeTasks'] });
    },
    onError: (error) => {
      console.error('Error deleting employee task:', error);
    },
  });
}
